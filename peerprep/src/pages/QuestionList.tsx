//Retrieve questionlist from api
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import theme from "../theme/theme";
import {
    Button,
    Chip,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    ThemeProvider,
} from "@mui/material";
import UserHeader from "../components/UserHeader";
import Header from "../components/Header";
import "../styles/QuestionList.css";

function QuestionList() {
    const [questions, setQuestions] = useState<any[]>([]);
    const [category, setCategory] = useState<string>("");
    const [difficulty, setDifficulty] = useState<string>("");
    const [isCreating, setIsCreating] = useState<boolean>(false); // State to manage create form visibility
    const [createTitle, setCreateTitle] = useState<string>(""); // Title for new question
    const [createDescription, setCreateDescription] = useState<string>(""); // Description for new question
    const [createCategory, setCreateCategory] = useState<string[]>([]); // Category for new question
    const [createDifficulty, setCreateDifficulty] = useState<string>(""); // Difficulty for new question
    const [editQuestion, setEditQuestion] = useState<any>(null); // Store question for editing
    const [newTitle, setNewTitle] = useState<string>(""); // Store new title during editing
    const [newDescription, setNewDescription] = useState<string>(""); // Store new description during editing
    const [newDifficulty, setNewDifficulty] = useState<string>(""); // Store new difficulty during editing
    const [newCategory, setNewCategory] = useState<string[]>([]); // Store new category during editing
    const [isAuth, setIsAuth] = useState<boolean>(false);
    const baseurl =
        process.env.REACT_APP_ENV === "development"
            ? "http://localhost:5000/question"
            : "https://service-327190433280.asia-southeast1.run.app/question";
    const navigate = useNavigate();

    const fetchQuestions = async () => {
        try {
            let url = `${baseurl}/getQuestion`;
            const params = new URLSearchParams();

            if (category) {
                params.append("category", category);
            }
            if (difficulty) {
                params.append("difficulty", difficulty);
            }

            // Only append query parameters if they exist
            if (params.toString()) {
                url += `?${params.toString()}`;
            }
            // console.log(url);
            fetch(url, {
                method: "GET",
            })
                .then((response) => response.json())
                .then((data) => {
                    // Sort questions by difficulty (Easy, Medium, Hard)
                    const sortedQuestions = data.sort((a: any, b: any) => {
                        const difficultyOrder = ["Easy", "Medium", "Hard"];
                        return (
                            difficultyOrder.indexOf(a.difficulty) -
                            difficultyOrder.indexOf(b.difficulty)
                        );
                    });
                    setQuestions(sortedQuestions);
                });
        } catch (err) {
            console.error(err);
            alert("An error occurred. Please try again");
        }
    };

    // Handle Create New Question
    const handleCreate = async () => {
        try {
            const newQuestion = {
                questionTitle: createTitle,
                questionDescription: createDescription,
                questionCategory: createCategory.join(", "),
                difficulty: createDifficulty,
            };

            await fetch(`${baseurl}/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newQuestion),
            });

            setIsCreating(false); // Hide the form after creation
            setCreateTitle("");
            setCreateDescription("");
            setCreateCategory([]);
            setCreateDifficulty("");

            // setQuestions((prevQuestions) => [...prevQuestions, newQuestion]);

            fetchQuestions(); // Refresh the question list
        } catch (error) {
            console.error("Error creating question:", error);
        }
    };

    // Handle Edit Button Click
    const handleEdit = (question: any) => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
        setEditQuestion(question); // Set the question to be edited
        setNewTitle(question.questionTitle); // Pre-fill the fields with current values
        setNewDescription(question.questionDescription);
        setNewDifficulty(question.difficulty);
        setNewCategory(question.questionCategory.split(", "));
    };

    // Handle Save Button Click (Update the Question)
    const handleSave = async () => {
        try {
            const updatedQuestion = {
                questionTitle: newTitle,
                questionDescription: newDescription,
                difficulty: newDifficulty, // Keep difficulty the same, or allow editing
                questionCategory: newCategory.join(", "), // Keep category the same, or allow editing
            };

            await fetch(`${baseurl}/${editQuestion._id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedQuestion),
            });

            setEditQuestion(null); // Close the edit form
            fetchQuestions(); // Refresh the question list
        } catch (error) {
            console.error("Error updating question:", error);
        }
    };

    // Handle Delete Button Click
    const handleDelete = async (_id: string) => {
        if (window.confirm("Are you sure you want to delete this question?")) {
            try {
                await fetch(`${baseurl}/${_id}`, {
                    method: "DELETE",
                });
                fetchQuestions(); // Refresh the question list
            } catch (error) {
                console.error("Error deleting question:", error);
            }
        }
    };

    useEffect(() => {
        // Get accessToken from localStorage
        const token = localStorage.getItem("accessToken");

        // Set authentication state based on token presence
        if (token) {
            setIsAuth(true);
        } else {
            setIsAuth(false);
            // Optional: Navigate to signin if not authenticated
            // navigate('/signin');
        }

        fetchQuestions();
    }, [category, difficulty]); // Remove `user` from dependencies as it's not needed

    return (
        <ThemeProvider theme={theme}>
            {isAuth ? <UserHeader /> : <Header />}
            <div>
                <h1>Question List</h1>

                {/* Dropdown for category */}
                <FormControl
                    className="dropdown"
                    variant="outlined"
                    style={{ margin: "10px" }}
                >
                    <InputLabel id="category-label" variant="filled">
                        Category
                    </InputLabel>
                    <Select
                        labelId="category-label"
                        className="dropdown"
                        value={category}
                        onChange={(e) => setCategory(e.target.value as string)}
                        label="Category"
                    >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="Strings">Strings</MenuItem>
                        <MenuItem value="Algorithms">Algorithms</MenuItem>
                        <MenuItem value="Data Structures">
                            Data Structures
                        </MenuItem>
                        <MenuItem value="Bit Manipulation">
                            Bit Manipulation
                        </MenuItem>
                        <MenuItem value="Recursion">Recursion</MenuItem>
                        <MenuItem value="Databases">Databases</MenuItem>
                        <MenuItem value="Brainteaser">Brainteaser</MenuItem>
                        {/* Add more categories as required */}
                    </Select>
                </FormControl>

                {/* Dropdown for difficulty */}
                <FormControl variant="outlined" style={{ margin: "10px" }}>
                    <InputLabel id="difficulty-label">Difficulty</InputLabel>
                    <Select
                        labelId="difficulty-label"
                        className="dropdown"
                        value={difficulty}
                        onChange={(e) =>
                            setDifficulty(e.target.value as string)
                        }
                        label="Difficulty"
                    >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="Easy">Easy</MenuItem>
                        <MenuItem value="Medium">Medium</MenuItem>
                        <MenuItem value="Hard">Hard</MenuItem>
                    </Select>
                </FormControl>

                {/* Create New Question Button */}
                {isAuth ? (
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        sx={{ ml: 2 }}
                        onClick={() => setIsCreating(true)}
                    >
                        Create New Question
                    </Button>
                ) : (
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        sx={{ ml: 2 }}
                        onClick={() => navigate("/signin")}
                    >
                        Sign In to Create Question
                    </Button>
                )}

                {/* Create form for new question */}
                {/* <Button
          variant="contained"
          color="primary"
          size="large"
          sx={{ ml: 2 }}
          onClick={() => setIsCreating(true)}>
          Create New Question 
        </Button> */}

                {/* Create form for new question */}
                {isCreating && isAuth && (
                    <div className="questionEdit">
                        <h3>Create New Question</h3>
                        <TextField
                            label="Title"
                            variant="outlined"
                            value={createTitle}
                            onChange={(e) => setCreateTitle(e.target.value)}
                            fullWidth
                            style={{ marginBottom: "10px" }}
                        />
                        <TextField
                            label="Description"
                            variant="outlined"
                            value={createDescription}
                            onChange={(e) =>
                                setCreateDescription(e.target.value)
                            }
                            fullWidth
                            style={{ marginBottom: "10px" }}
                        />
                        <FormControl
                            variant="outlined"
                            style={{ marginBottom: "10px", width: "100%" }}
                        >
                            <InputLabel>Category</InputLabel>
                            <Select
                                multiple
                                value={createCategory}
                                onChange={(e) =>
                                    setCreateCategory(
                                        e.target.value as string[]
                                    )
                                }
                                renderValue={(selected) => (
                                    <div>
                                        {selected.map((value) => (
                                            <Chip
                                                key={value}
                                                label={value}
                                                style={{ margin: "2px" }}
                                            />
                                        ))}
                                    </div>
                                )}
                                label="Category"
                            >
                                <MenuItem value="Strings">Strings</MenuItem>
                                <MenuItem value="Algorithms">
                                    Algorithms
                                </MenuItem>
                                <MenuItem value="Data Structures">
                                    Data Structures
                                </MenuItem>
                                <MenuItem value="Bit Manipulation">
                                    Bit Manipulation
                                </MenuItem>
                                <MenuItem value="Recursion">Recursion</MenuItem>
                                <MenuItem value="Databases">Databases</MenuItem>
                                <MenuItem value="Brainteaser">
                                    Brainteaser
                                </MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl
                            variant="outlined"
                            style={{ marginBottom: "10px", width: "100%" }}
                        >
                            <InputLabel>Difficulty</InputLabel>
                            <Select
                                value={createDifficulty}
                                onChange={(e) =>
                                    setCreateDifficulty(
                                        e.target.value as string
                                    )
                                }
                                label="Difficulty"
                            >
                                <MenuItem value="Easy">Easy</MenuItem>
                                <MenuItem value="Medium">Medium</MenuItem>
                                <MenuItem value="Hard">Hard</MenuItem>
                            </Select>
                        </FormControl>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleCreate}
                        >
                            Create
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => setIsCreating(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                )}
                {editQuestion && isAuth && (
                    <div className="questionEdit">
                        <h3>Edit Question</h3>
                        <TextField
                            label="Title"
                            variant="outlined"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            fullWidth
                            style={{ marginBottom: "10px" }}
                        />
                        <TextField
                            label="Description"
                            variant="outlined"
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                            fullWidth
                            style={{ marginBottom: "10px" }}
                        />
                        <TextField
                            label="Difficulty"
                            variant="outlined"
                            value={newDifficulty}
                            onChange={(e) => setNewDifficulty(e.target.value)}
                            fullWidth
                            style={{ marginBottom: "10px" }}
                        />
                        <FormControl
                            variant="outlined"
                            style={{ marginBottom: "10px", width: "100%" }}
                        >
                            <InputLabel>Category</InputLabel>
                            <Select
                                multiple
                                value={newCategory}
                                onChange={(e) =>
                                    setNewCategory(e.target.value as string[])
                                }
                                renderValue={(selected) => (
                                    <div>
                                        {selected.map((value) => (
                                            <Chip
                                                key={value}
                                                label={value}
                                                style={{ margin: "2px" }}
                                            />
                                        ))}
                                    </div>
                                )}
                                label="Category"
                            >
                                <MenuItem value="Strings">Strings</MenuItem>
                                <MenuItem value="Algorithms">
                                    Algorithms
                                </MenuItem>
                                <MenuItem value="Data Structures">
                                    Data Structures
                                </MenuItem>
                                <MenuItem value="Bit Manipulation">
                                    Bit Manipulation
                                </MenuItem>
                                <MenuItem value="Recursion">Recursion</MenuItem>
                                <MenuItem value="Databases">Databases</MenuItem>
                                <MenuItem value="Brainteaser">
                                    Brainteaser
                                </MenuItem>
                                {/* Add more categories as required */}
                            </Select>
                        </FormControl>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSave}
                        >
                            Save
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => setEditQuestion(null)}
                            style={{ marginLeft: "10px" }}
                        >
                            Cancel
                        </Button>
                    </div>
                )}
                {/* List of questions */}
                <ol>
                    {questions.map((question, index) => (
                        <li className="list-group-item" key={index}>
                            <h4>{question.questionTitle}</h4>
                            <h5>{question.difficulty}</h5>
                            <h6>{question.questionDescription}</h6>
                            <p>{question.questionCategory}</p>
                            {isAuth ? (
                                <>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleEdit(question)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        onClick={() =>
                                            handleDelete(question._id)
                                        }
                                    >
                                        Delete
                                    </Button>
                                </>
                            ) : (
                                <></>
                            )}
                        </li>
                    ))}
                </ol>
            </div>
        </ThemeProvider>
    );
}

export default QuestionList;
