# Do-It-Now

**Do-It-Now** is a personal task management system that helps you organize your day into structured chunks, track your progress, and manage your daily activities. The project is built using modern web technologies like `React` and `Node.js` (`ShadCN` for UI), with features such as custom scheduling, dynamic task tracking, and performance evaluation based on user-defined activity metrics.

![image](https://github.com/user-attachments/assets/68197546-137a-4d86-8c1d-8099a2bd22d4)

## Features

- **Daily Scheduling**: Divide your day into equal time chunks and assign tasks.
- **Task Management**: Add, edit, delete, and complete tasks with real-time updates.
- **Sleep Tracking**: Monitor and adjust your sleep schedule to avoid sleep debt.
- **Dynamic Time Adjustment**: Predict day length based on previous day’s sleep and activity hours.
- **Task Sorting**: Sort tasks based on their creation date and completion status.
- **Responsive Design**: Fully responsive UI to work seamlessly on any device.
- **Data Persistence**: Tasks and schedules are stored and persisted with a backend service.

## Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS, ShadCN (for components like toast, checkbox, etc.)
- **Backend**: Node.js, Express, MongoDB (with Mongoose ORM)
- **Database**: MongoDB for task and user data storage.
- **Utilities**: Axios for API calls, IntersectionObserver for dynamic task loading, Date manipulation with native JavaScript `Date` and `toLocaleString`.

## Installation

### Prerequisites
Before you begin, ensure you have the following installed:
- **Node.js** (>=16.x)
- **MongoDB** (>=5.x)

### Steps
1. **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/do-it-now.git
    cd do-it-now
    ```

2. **Install dependencies** for both the frontend and backend:
    - Frontend:
      ```bash
      cd client
      npm install
      ```
    - Backend:
      ```bash
      cd server
      npm install
      ```

3. **Environment Variables**:
   Create a `.env` file in the root of the `server` directory with the following variables:
   ```env
   VITE_BACKEND_URL=http://localhost:5000
   MONGO_URI=mongodb://localhost:27017/do-it-now
   ```

4. **Start MongoDB**:
    ```bash
    mongod
    ```

5. **Start the backend**:
    ```bash
    cd server
    npm run dev
    ```

6. **Start the frontend**:
    ```bash
    cd client
    npm run dev
    ```

7. **Visit the app**:
    - Open your browser and go to `http://localhost:3000` for the frontend interface.

## Usage

### Adding Tasks
1. Create a new task by filling in the task title, duration, and assigning it to a specific chunk.
2. The tasks will be dynamically loaded and displayed based on their scheduled time.

### Managing Sleep Schedule
- Start and end times for sleep can be manually set. The system will adjust day length predictions based on the last day’s sleep duration and activity.

### Deleting Tasks
1. Click on the task you wish to delete, and confirm the deletion.
2. A toast message will notify you of the successful deletion.

### Sorting Tasks
- Tasks are automatically sorted by their creation date, with completed tasks shown last.

## Key Concepts

- **Chunk-based Scheduling**: The day is divided into 5 equal time chunks, and tasks are scheduled accordingly.
- **Sleep Debt & Day Prediction**: Based on how much you sleep versus how much work you do, the next day’s length is dynamically adjusted using the sleep debt formula.
- **Custom Animations**: Smooth scrolling, task transitions, and animations are handled using CSS and IntersectionObserver for optimal UX.

## Known Issues & Future Improvements

- **Sticky Elements**: When using `position: absolute`, sticky behavior for certain elements doesn't work. A workaround is needed for sticky tasks inside absolute containers.
- **Performance Enhancements**: The app may experience performance slowdowns when a large number of tasks are loaded simultaneously. Potential future improvement could include optimizing rendering and chunk-loading strategies.

## Contribution

Feel free to contribute to the project by forking the repository and submitting pull requests. Contributions such as bug fixes, new features, and performance improvements are welcome.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/some-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/some-feature`)
5. Create a new Pull Request

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
