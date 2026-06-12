const getCity = async (params, token) => {
    // Placeholder implementation; replace with actual getCity API import if needed.
    return [];
};

const getData = async () => {
    try {
        const response = await getNationality(0, TOKEN_KEY);
        console.log("dropdown ", response)
        const data = response.map((value, index) => ({ id: value.id, value: value.name }))
        SetDropDown((prevData) => ({
            ...prevData,
            "nationality": data
        }));
    } catch (err) {
        console.log(err)
    }
}
const getStatedata = async () => {
    try {
        const response = await getState({"id":0}, TOKEN_KEY);
        console.log("dropdown ", response.data)
        const data = response.data.map((value, index) => ({ id: value.id, value: value.name }))
        SetDropDown((prevData) => ({
            ...prevData,
            "state": data
        }));
    } catch (err) {
        console.log(err)
    }
}
getStatedata()
const getCitydata = async () => {
    try {
        const response = await getCity({"id":0, "stateId": 0 }, TOKEN_KEY);
        console.log("Citydropdown ", response)
        const data = response.map((value, index) => ({ id: value.id, value: value.name }))
        SetDropDown((prevData) => ({
            ...prevData,
            "city": data
        }));
    } catch (err) {
        console.log(err)
    }
}
getCitydata()
const getclassdata = async () => {
    try {
        const response = await getClass(0, TOKEN_KEY);
        console.log("Classdropdown ", response)
        const data = response.map((value, index) => ({ id: value.id, value: value.name }))
        SetDropDown((prevData) => ({
            ...prevData,
            "classId": data
        }));
    } catch (err) {
        console.log(err)
    }
}
getclassdata()    
const getsectiondata = async () => {
    try {
        const response = await getSection(0, TOKEN_KEY);
        console.log("Classdropdown ", response)
        const data=response.map((value,index)=>({ id: value.id, value: value.name }))
        SetDropDown((prevData) => ({
            ...prevData,  
            "sectionId": data
          }));
    } catch (err) {
        console.log(err)
    }
}
getsectiondata()
const getcommunitydata = async () => {
    try {
        const response = await getCommunity(0, TOKEN_KEY);
        console.log("Classdropdown ", response)
        const data=response.map((value,index)=>({ id: value.id, value: value.name }))
        SetDropDown((prevData) => ({
            ...prevData,  
            "communityId": data
          }));
    } catch (err) {
        console.log(err)
    }
}
getcommunitydata()
const getbloodgroupdata = async () => {
    try {
        const response = await getBloodGroup(0, TOKEN_KEY);
        console.log("Classdropdown ", response)
        const data=response.map((value,index)=>({ id: value.id, value: value.name }))
        SetDropDown((prevData) => ({
            ...prevData,  
            "bloodGroupId": data
          }));
    } catch (err) {
        console.log(err)
    }
}
getbloodgroupdata()
const getreligiondata = async () => {
    try {
        const response = await getReligion(0, TOKEN_KEY);
        console.log("Classdropdown ", response)
        const data=response.map((value,index)=>({ id: value.id, value: value.name }))
        SetDropDown((prevData) => ({
            ...prevData,  
            "religionId": data
          }));
    } catch (err) {
        console.log(err)
    }
}
getreligiondata()
