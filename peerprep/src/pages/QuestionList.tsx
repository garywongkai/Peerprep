//Retrieve questionlist from api
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { auth, db, theme } from '../firebase';
import { ThemeProvider } from '@mui/material';
import UserHeader from '../components/UserHeader';
import '../styles/QuestionList.css';
function QuestionList() {
  const [user, loading, error] = useAuthState(auth);
  const [questions, setQuestions] = useState<any[]>([]);
  const url = 'https://service-327190433280.asia-southeast1.run.app/question';
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
    if (!user) return navigate('/signin');
    fetchQuestions();
  }, [user, loading]);

  return (
    <ThemeProvider theme={theme}>
      <UserHeader/>
      <div>
        <h1>Question List</h1>
        <ol>
          {questions.map((question, index) => {
            return (
                <li className="list-group-item" key={index}>
                  <h4>{question.questionTitle}</h4>
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