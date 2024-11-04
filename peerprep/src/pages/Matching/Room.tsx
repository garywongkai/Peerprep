import { useLocation } from 'react-router-dom';

const Room = () => {
    const location = useLocation();
    const { socketId, difficulty, category } = location.state || {};

    return (
        <div>
            <h1>Welcome to Room</h1>
            <p>Socket ID: {socketId}</p>
            <p>Difficulty: {difficulty}</p>
            <p>Category: {category}</p>
        </div>
    );
};

export default Room;