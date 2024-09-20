//Retrieve questionlist from api
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { auth, db, theme } from '../firebase';
import { ThemeProvider } from '@mui/material';
import Header from '../components/Header';

function QuestionList() {
  const [user, loading, error] = useAuthState(auth);
  const [questions, setQuestions] = useState<any[]>([]);
  const url = 'http://localhost:5000/question';
  const navigate = useNavigate();

  const fetchQuestions = async () => {
    try {
        fetch(url, {
            method: 'GET'
        }).then(response => response.json()).then((data) => setQuestions(data));
    } catch (err) {
      console.error(err);
      alert('An error occurred. Please try again');
    }
  };

  useEffect(() => {
    if (!user) return navigate('/');
    fetchQuestions();
  }, [user, loading]);

  return (
    <ThemeProvider theme={theme}>
      <Header />
      <div>
        <h1>Question List</h1>
        <ul>
          {questions.map((question, index) => {
            return (
                <li key={index}>
                    <h2>{question.questionDescription}</h2>
                    <p>{question.questionCategory}</p>
                </li>
            );
          })}
        </ul>
      </div>
    </ThemeProvider>
  );
}

export default QuestionList;