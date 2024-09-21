//Retrieve questionlist from api
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { auth, db, theme } from '../firebase';
import { Button, FormControl, InputLabel, MenuItem, Select, ThemeProvider } from '@mui/material';
import UserHeader from '../components/UserHeader';
import '../styles/QuestionList.css';
function QuestionList() {
  const [user, loading, error] = useAuthState(auth);
  const [questions, setQuestions] = useState<any[]>([]);
  const [category, setCategory] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('');
  const baseurl = 'https://service-327190433280.asia-southeast1.run.app/question';
  const navigate = useNavigate();

  const fetchQuestions = async () => {
    try {
        let url = baseurl;
        if (category || difficulty) {
          url += `/getQuestion?category=${category}&difficulty=${difficulty}`;
        }
        fetch(url, {
            method: 'GET'
        }).then(response => response.json()).then((data) => setQuestions(data));
    } catch (err) {
      console.error(err);
      alert('An error occurred. Please try again');
    }
  };

  useEffect(() => {
    if (!user) return navigate('/signin');
    fetchQuestions();
  }, [user, loading, category, difficulty]);

  // return (
  //   <ThemeProvider theme={theme}>
  //     <UserHeader/>
  //     <div>
  //       <h1>Question List</h1>
  //       <ol>
  //         {questions.map((question, index) => {
  //           return (
  //               <li className="list-group-item" key={index}>
  //                 <h4>{question.questionTitle}</h4>
  //                   <h6>{question.questionDescription}</h6>
  //                   <p>{question.questionCategory}</p>
  //               </li>
  //           );
  //         })}
  //       </ol>
  //     </div>
  //   </ThemeProvider>
  // );
  return (
    <ThemeProvider theme={theme}>
      <UserHeader />
      <div>
        <h1>Question List</h1>

        {/* Dropdown for category */}
        <FormControl variant="outlined" style={{ margin: '10px' }}>
          <InputLabel id="category-label">Category</InputLabel>
          <Select
            labelId="category-label"
            value={category}
            onChange={(e) => setCategory(e.target.value as string)}
            label="Category"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Strings">Strings</MenuItem>
            <MenuItem value="Algorithms">Algorithms</MenuItem>
            <MenuItem value="Data Structures">Data Structures</MenuItem>
            <MenuItem value="Bit Manipulation">Bit Manipulation</MenuItem>
            <MenuItem value="Recursion">Recursion</MenuItem>
            <MenuItem value="Databases">Databases</MenuItem>
            <MenuItem value="Brainteaser">Brainteaser</MenuItem>
            {/* Add more categories as required */}
          </Select>
        </FormControl>

        {/* Dropdown for difficulty */}
        <FormControl variant="outlined" style={{ margin: '10px' }}>
          <InputLabel id="difficulty-label">Difficulty</InputLabel>
          <Select
            labelId="difficulty-label"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as string)}
            label="Difficulty"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Easy">Easy</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="Hard">Hard</MenuItem>
          </Select>
        </FormControl>

        <div style={{ margin: '10px' }}>
          <Button variant="contained" color="primary" onClick={fetchQuestions}>
            Filter Questions
          </Button>
        </div>

        {/* List of questions */}
        <ol>
          {questions.map((question, index) => {
            return (
              <li className="list-group-item" key={index}>
                <h4>{question.questionTitle}</h4>
                <h5>{question.difficulty}</h5>
                <h6>{question.questionDescription}</h6>
                <p>{question.questionCategory}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </ThemeProvider>
  );
}

export default QuestionList;