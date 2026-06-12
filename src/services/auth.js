// export const TOKEN_KEY1='TOKEN_KEY' ;
// // export const TOKEN_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyTmFtZSI6IktTVDFBMDAwMDMiLCJhZG1pbmlzdHJhdGlvbklkIjoxLCJyb2xlIjoiQWRtaW4iLCJhZG1pc3Npb25ObyI6IktTVCIsInJlZ2lzdHJhdGlvbk5vIjoiLSIsIm1lbWJlckNoZWNrIjoxMiwic2VuZEVtYWlsIjoiWWVzIiwic2VuZFNtcyI6Ik5vIiwiaWF0IjoxNzc5ODYzMzQ0LCJleHAiOjE4MTEzOTkzNDR9.HPG3tU3AgohnVUogmLQ1Ta7shuJZOLb6AEkVlwv7u-8' ;
export const STAFF_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyTmFtZSI6IktTVDFTMDAwMDEiLCJhZG1pbmlzdHJhdGlvbklkIjoxLCJyb2xlIjoiU3RhZmYiLCJhZG1pc3Npb25ObyI6IktTVCIsInJlZ2lzdHJhdGlvbk5vIjoiLSIsImlhdCI6MTcwMzEzNDUxMCwiZXhwIjoxNzM0NjcwNTEwfQ.ftKFfF-GJOORXVpFYmBTR3MZSru9qzlSmUH1njPo9DY' ;
export const ADMIN_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyTmFtZSI6ImFmcWRmcWNkeXNhZiIsImFkbWluaXN0cmF0aW9uSWQiOjEsImVtYWlsSWQiOiJhc3MyZ2cuY29tIiwicm9sZSI6IlN0dWRlbnQiLCJjbGFzc0lkIjoxLCJzZWN0aW9uSWQiOjEsImFkbWlzc2lvbk5vIjoiS1NUIiwicmVnaXN0cmF0aW9uTm8iOiItIiwibWVtYmVyQ2hlY2siOjEyLCJzZW5kRW1haWwiOiJZZXMiLCJzZW5kU21zIjoiTm8iLCJpYXQiOjE3MDg2ODk1MzMsImV4cCI6MTc0MDIyNTUzM30.TNUkvW-mmG6TiWb_k6l0CvQ7Rzd6KZiKOa0VyBaTOmc'

// export const getToken = () => localStorage.getItem("TOKEN_KEY");

// export const setToken = (token) => localStorage.setItem("TOKEN_KEY", token);


// export const setUserData = (name,token) => localStorage.setItem(name, token);

// export const getUserData = (data) => localStorage.getItem(data);

// export const removeToken = () => localStorage.clear();;

// export const isAuthenticated = () => !!getToken();


export const TOKEN_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyTmFtZSI6IktTVDFBMDAwMDMiLCJhZG1pbmlzdHJhdGlvbklkIjoxLCJyb2xlIjoiQWRtaW4iLCJhZG1pc3Npb25ObyI6IktTVCIsInJlZ2lzdHJhdGlvbk5vIjoiLSIsIm1lbWJlckNoZWNrIjoxMiwic2VuZEVtYWlsIjoiWWVzIiwic2VuZFNtcyI6Ik5vIiwiaWF0IjoxNzc5ODc0OTg3LCJleHAiOjE4MTE0MTA5ODd9.G5xskAR-v9FXO4zW_aNntJLuyRGUkZx-hnRTTIfkzn8";

// Get token
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

// Set token
export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

// Save user data
export const setUserData = (name, token) => {
  localStorage.setItem(name, token);
};

// Get user data
export const getUserData = (data) => {
  return localStorage.getItem(data);
};

// Remove token
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

// Check authentication
export const isAuthenticated = () => {
  return !!getToken();
};
