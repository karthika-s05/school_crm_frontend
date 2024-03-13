export const TOKEN_KEY1='TOKEN_KEY' ;
export const TOKEN_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyTmFtZSI6IktTVDFBMDAwMDEiLCJhZG1pbmlzdHJhdGlvbklkIjoxLCJyb2xlIjoiQWRtaW4iLCJhZG1pc3Npb25ObyI6IktTVCIsInJlZ2lzdHJhdGlvbk5vIjoiLSIsImlhdCI6MTY5NTk4OTU0MSwiZXhwIjoxNzI3NTI1NTQxfQ.Wqmhh483_FSqYJeHlYi8AXDIlqdy0W6ChQoAuK1XfG8' ;
export const STAFF_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyTmFtZSI6IktTVDFTMDAwMDEiLCJhZG1pbmlzdHJhdGlvbklkIjoxLCJyb2xlIjoiU3RhZmYiLCJhZG1pc3Npb25ObyI6IktTVCIsInJlZ2lzdHJhdGlvbk5vIjoiLSIsImlhdCI6MTcwMzEzNDUxMCwiZXhwIjoxNzM0NjcwNTEwfQ.ftKFfF-GJOORXVpFYmBTR3MZSru9qzlSmUH1njPo9DY' ;
export const ADMIN_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyTmFtZSI6ImFmcWRmcWNkeXNhZiIsImFkbWluaXN0cmF0aW9uSWQiOjEsImVtYWlsSWQiOiJhc3MyZ2cuY29tIiwicm9sZSI6IlN0dWRlbnQiLCJjbGFzc0lkIjoxLCJzZWN0aW9uSWQiOjEsImFkbWlzc2lvbk5vIjoiS1NUIiwicmVnaXN0cmF0aW9uTm8iOiItIiwibWVtYmVyQ2hlY2siOjEyLCJzZW5kRW1haWwiOiJZZXMiLCJzZW5kU21zIjoiTm8iLCJpYXQiOjE3MDg2ODk1MzMsImV4cCI6MTc0MDIyNTUzM30.TNUkvW-mmG6TiWb_k6l0CvQ7Rzd6KZiKOa0VyBaTOmc'

export const getToken = () => localStorage.getItem(TOKEN_KEY1);

export const setToken = (token) => localStorage.setItem(TOKEN_KEY1, token);

export const setUserData = (name,token) => localStorage.setItem(name, token);

export const getUserData = (data) => localStorage.getItem(data);

export const removeToken = () => localStorage.clear();;

export const isAuthenticated = () => !!getToken();
