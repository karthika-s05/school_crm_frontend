import { configureStore } from "@reduxjs/toolkit";
import masterSlice from "./masterSlice";

const store = configureStore({
    reducer: {
        master: masterSlice
    }
});

export default store;