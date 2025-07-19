# Take-Home Assessment Solution

This document describes the key decisions made while completing the take-home assessment.

## 🔧 Backend

### 1. Refactoring Blocking I/O
Synchronous calls like `fs.readFileSync` and `fs.writeFileSync` in `src/routes/items.js` were replaced with their asynchronous counterparts from `fs.promises` using `async/await`. This prevents blocking the main Node.js thread, improving server performance and responsiveness.

### 2. Performance Optimization (`/api/stats`)
An in-memory caching strategy was implemented for the `/api/stats` route. Statistics are recalculated only if the modification time of the `data/items.json` file has changed. This significantly reduces the load during frequent requests to this endpoint.

### 3. Testing
Unit tests were written for the `items` and `stats` routes using Jest and Supertest. The `fs` module was mocked (`jest.mock`) to make the tests fast, predictable, and isolated from the actual file system.

### 4. Security
A critical Remote Code Execution (RCE) vulnerability was identified and fixed in `backend/src/middleware/errorHandler.js`. The use of `new Function(...)` on data fetched from an external source was replaced with safe error handling.

## 💻 Frontend

### 1. Memory Leak Fix
The memory leak in the `Items.js` component was resolved using the `useEffect` hook and an `AbortController`. This ensures that the network request is canceled if the component unmounts before the fetch completes, preventing attempts to update the state of an unmounted component.

### 2. Pagination & Search
Server-side pagination and search were implemented. On the client, a custom `useDebounce` hook is used for search queries to avoid excessive API requests while the user is typing. The API now returns data in a format that includes pagination metadata.

### 3. List Virtualization
The `react-window` library was integrated to display the list of items. This renders only the visible elements, ensuring a smooth UI even with very large datasets.

### 4. UI/UX Polish
To improve the user experience, a `SkeletonLoader` component was added. It is displayed during data fetching to provide visual feedback to the user.

## Trade-offs and Assumptions

- **Data Validation:** Input validation for `POST /api/items` was intentionally omitted as per the `README.md`. In a production application, a library like `Joi` or `Zod` would be used here.
- **Error Handling:** Error handling is implemented at a basic level. A production system would benefit from more detailed logging and error classification.