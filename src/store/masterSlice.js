import {createSlice} from '@reduxjs/toolkit'

const initialState=[];

const masterSlice=createSlice({
    name:'master',
    initialState,
    reducers:{
        addState(state,action){
            state.push(action.payload)
        }
    }
})

export const {addState}=masterSlice.actions;
export default masterSlice.reducer;
