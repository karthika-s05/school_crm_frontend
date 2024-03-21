import axios from "axios";

const MASTER_URL = "http://49.207.183.18:8089";
const DAILY_URL = "http://49.207.183.18:8090";
// const DAILY_URL = "http://192.168.0.119:6010";
const LOGIN_URL = "http://49.207.183.18:8084";
const ADMIN_URL = 'http://192.168.0.11:1010';
// const ADMIN_URL = "http://49.207.183.18:8086";
const STATIONERY_URL = "http://49.207.183.18:8092";
const STAFF_URL = "http://49.207.183.18:8090";
const EXAM_URL = "http://49.207.183.18:8091";
const GRADE_URL = "http://49.207.183.18:8089";

export const getClassSectionMap = async (id, token) => {
  try {
    const response = await axios.get(
      `${MASTER_URL}/academic/get_classSectionMap/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const getClassTeacherMap = async (body, token) => {
  console.log(body);
  try {
    const response = await axios.post(
      `${MASTER_URL}/classTeacher_mapping/get_classTeacher`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const getSubjectTeacherMap = async (body, token) => {
  console.log(body);
  try {
    const response = await axios.post(
      `${MASTER_URL}/teacherSubject_mapping/get_teacherSubject`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const getSection = async (id, token) => {
  try {
    const response = await axios.get(
      `${MASTER_URL}/academic/get_section/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const getState = async (body, token) => {
  try {
    const response = await axios.post(
      `${MASTER_URL}/state_master/get_state`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const getClass = async (id, token) => {
  try {
    const response = await axios.get(`${MASTER_URL}/academic/get_class/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    console.log(response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const getCity = async (body, token) => {
  try {
    const response = await axios.post(
      `${MASTER_URL}/city_master/get_city`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const getBloodGroup = async (id, token) => {
  try {
    const response = await axios.get(
      `${MASTER_URL}/bloodgroup_master/get_bloodGroup/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const getCommunity = async (id, token) => {
  try {
    const response = await axios.get(
      `${MASTER_URL}/community_master/get_community/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const getNationality = async (id, token) => {
  try {
    const response = await axios.get(
      `${MASTER_URL}/nationality_master/get_nationality/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const getReligion = async (id, token) => {
  try {
    const response = await axios.get(
      `${MASTER_URL}/religion_master/get_religion/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const getSubject = async (id, token) => {
  console.log(id);
  try {
    const response = await axios.get(
      `${MASTER_URL}/subject_master/get_subject/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const getPeriodSlot = async (token) => {
  try {
    const response = await axios.get(`${DAILY_URL}/timetable/get_period_slot`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    console.log(response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const getPeriodSlotbyID = async (id, token) => {
  try {
    const response = await axios.post(
      `${DAILY_URL}/timetable/get_period_slot/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const getTimeTable = async (body, token) => {
  try {
    const response = await axios.post(
      `${DAILY_URL}/timetable/get_class_timetable`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const getTimeTableByID = async (id, body, token) => {
  console.log(body);
  try {
    const response = await axios.post(
      `${DAILY_URL}/timetable/get_class_timetable/${id}`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("TimeTable", response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const getDay = async (token) => {
  try {
    const response = await axios.get(`${DAILY_URL}/timetable/getDay`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    console.log(response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const getTransport = async (body, token) => {
  try {
    const response = await axios.post(
      `${STATIONERY_URL}/transport/get_transport`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const postState = async (body, token) => {
  try {
    const response = await axios.post(
      `${MASTER_URL}/state_master/post_state`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const postCity = async (body, token) => {
  try {
    const response = await axios.post(
      `${MASTER_URL}/city_master/post_city`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const postBloodGroup = async (body, token) => {
  try {
    const response = await axios.post(
      `${MASTER_URL}/bloodgroup_master/post_bloodGroup`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const postCommunity = async (body, token) => {
  try {
    const response = await axios.post(
      `${MASTER_URL}/community_master/post_community`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const postNationality = async (body, token) => {
  try {
    const response = await axios.post(
      `${MASTER_URL}/nationality_master/post_nationality`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const postReligion = async (body, token) => {
  try {
    const response = await axios.post(
      `${MASTER_URL}/religion_master/post_religion`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const postSubject = async (body, token) => {
  console.log(body, "manimaran");
  try {
    const response = await axios.post(
      `${MASTER_URL}/subject_master/post_subjects`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          // 'Content-Type': 'multipart/form-data',
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const postClass = async (body, token) => {
  try {
    const response = await axios.post(
      `${MASTER_URL}/academic/post_class`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const postSection = async (body, token) => {
  try {
    const response = await axios.post(
      `${MASTER_URL}/academic/post_section`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const postClassSection = async (body, token) => {
  const data = {
    id: body.id,
    classId: body.classId,
    sectionId: body.sectionId,
    totalCount: parseInt(body.totalCount)
  }
  console.log(body, "0000")
  try {
    const response = await axios.post(
      `${MASTER_URL}/academic/post_classSectionMap`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const postClassTeacherMap = async (body, token) => {
  try {
    const response = await axios.post(
      `${MASTER_URL}/classTeacher_mapping/post_classTeacher`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const postSubjectTeacherMap = async (body, token) => {
  try {
    const response = await axios.post(
      `${MASTER_URL}/teacherSubject_mapping/post_teacherSubject`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const postStationery = async (body, token) => {
  try {
    const response = await axios.post(
      `${STATIONERY_URL}/stationery/post_stationery`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const postTimeSlot = async (body, token) => {
  console.log("CLass", body);
  try {
    const response = await axios.post(
      `${DAILY_URL}/timetable/create_period_slot`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const postTimeTable = async (body, token) => {
  try {
    const response = await axios.post(
      `${DAILY_URL}/timetable/create_class_timetable`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const postTransport = async (body, token) => {
  try {
    const response = await axios.post(
      `${STATIONERY_URL}/transport/postUpdate_transport`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const updateStationery = async (body, token) => {
  try {
    const response = await axios.post(
      `${STATIONERY_URL}/stationery/update_stationery`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const deleteState = async (body, token) => {
  console.log(body, token);
  try {
    const response = await axios.post(
      `${MASTER_URL}/state_master/delete_state/${body}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const deleteCity = async (body, token) => {
  try {
    const response = await axios.post(
      `${MASTER_URL}/city_master/delete_city/${body}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const deleteBloodGroup = async (body, token) => {
  try {
    const response = await axios.post(
      `${MASTER_URL}/bloodgroup_master/delete_bloodGroup/${body}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const deleteCommunity = async (body, token) => {
  try {
    const response = await axios.post(
      `${MASTER_URL}/community_master/delete_community/${body}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const deleteNationality = async (body, token) => {
  try {
    const response = await axios.post(
      `${MASTER_URL}/nationality_master/delete_nationality/${body}`,
      {},
      {
        headers: {
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyTmFtZSI6IktTVDFBMDAwMDEiLCJhZG1pbmlzdHJhdGlvbklkIjoxLCJyb2xlIjoiQWRtaW4iLCJhZG1pc3Npb25ObyI6IktTVCIsInJlZ2lzdHJhdGlvbk5vIjoiLSIsImlhdCI6MTY5NTk4OTU0MSwiZXhwIjoxNzI3NTI1NTQxfQ.Wqmhh483_FSqYJeHlYi8AXDIlqdy0W6ChQoAuK1XfG8`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const deleteReligion = async (body, token) => {
  try {
    const response = await axios.post(
      `${MASTER_URL}/religion_master/delete_religion/${body}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const deleteSubject = async (body, token) => {
  try {
    const response = await axios.post(
      `${MASTER_URL}/subject_master/delete_subject/${body}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const deleteClass = async (body, token) => {
  console.log(body, token);
  try {
    const response = await axios.post(
      `${MASTER_URL}/academic/delete_class/${body}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const deleteSection = async (body, token) => {
  try {
    const response = await axios.post(
      `${MASTER_URL}/academic/deletesection/${body}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const deleteClassSection = async (body, token) => {
  try {
    const response = await axios.post(
      `${MASTER_URL}/academic/delete_classSectionMap/${body}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const deleteClassTeacher = async (body, token) => {
  try {
    const response = await axios.post(
      `${MASTER_URL}/classTeacher_mapping/delete_classTeacher/${body}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const deleteSubjectTeacher = async (body, token) => {
  try {
    const response = await axios.post(
      `${MASTER_URL}/teacherSubject_mapping/delete_teacherSubject/${body}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const deleteStationery = async (id, token) => {
  try {
    const response = await axios.post(
      `${STATIONERY_URL}/stationery/delete_stationery`,
      { id },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const deletePeriodSlot = async (id, token) => {
  try {
    const response = await axios.post(
      `${DAILY_URL}/timetable/delete_period_slot/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const deletetimetableApi = async (id, token) => {
  try {
    const response = await axios.post(
      `${DAILY_URL}/timetable/delete_class_timetable/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const deleteTransportApi = async (id, token) => {
  try {
    const response = await axios.post(
      `${STATIONERY_URL}/transport/delete_transport/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const registerStaff = async (body, token) => {
  try {
    const response = await axios.post(
      `${ADMIN_URL}/admin/registration/staff`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const studentStaff = async (body, token) => {
  try {
    const response = await axios.post(
      `${ADMIN_URL}/admin/registration/student`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const getStudentlist = async (data, token) => {
  try {
    let body = {
      userName: data.userName,
      classId: data.classId ? data.classId : 0,
      sectionId: data.sectionId ? data.sectionId : 0,
    };
    console.log(body);
    const response = await axios.post(
      `${ADMIN_URL}/admin/registration/get_student`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const getStudentToCheck = async (data, token) => {
  try {
    const response = await axios.post(
      `${ADMIN_URL}/admin/registration/get_studentToCheck`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const getStafflist = async (id, token) => {
  try {
    let body = {
      userName: id,
      role: "Admin",
    };
    console.log(body);
    const response = await axios.post(
      `${ADMIN_URL}/admin/registration/get_staff`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const getAdminlist = async (id, token) => {
  try {
    let body = {
      id,
    };
    const response = await axios.post(
      `${ADMIN_URL}/admin/registration/get_adminUser_list`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const getStationery = async (body, token) => {
  try {
    const response = await axios.post(
      `${STATIONERY_URL}/stationery/get_stationery`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const relieveStud = async (body, token) => {
  const data = {
    studentID: body.studentID,
    studentReleavingDate: body.studentReleavingDate,
    studentReleavingReason: body.studentReleavingReason,
    transferCertificateNo: body.transferCertificateNo,
  }
  try {
    const response = await axios.post(
      `${ADMIN_URL}/admin/releaving/student`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const relieveStaff = async (body, token) => {
  const data = {
    staffId: body.staffId,
    date_of_releaving: body.date_of_releaving,
    reason_for_releaving: body.reason_for_releaving
  }
  console.log("love", body)
  try {
    const response = await axios.post(
      `${ADMIN_URL}/admin/releaving/staff`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const login = async (userName, password) => {
  try {
    const response = await axios.post(`${LOGIN_URL}/user/logIn`, {
      userName,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

// let value={
//   "id": 0,
//   "subjectId":1,
//   "title": "your_title_valu",
//   "description": "your_description_value",
//   "startDate": "2023-12-28",
//   "endDate": "2023-12-30",
//   "classId": 1,
//   "sectionId": 1
// };
export const createAssignment = async (body, token) => {
  try {
    const response = await axios.post(
      `${STAFF_URL}/assignment/create_update_assignment`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const getAssignment = async (body, token) => {
  try {
    const response = await axios.post(
      `${STAFF_URL}/assignment/get_assignment_staff_view`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const deletetAssignment = async (id, token) => {
  try {
    const response = await axios.post(
      `${STAFF_URL}/assignment/delete_assignment/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const studentReport = async (body, token) => {
  try {
    const response = await axios.post(
      `${STAFF_URL}/assignment/get_assignment_staff_report`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
//  Homework
export const createHomework = async (body, token) => {
  try {
    const response = await axios.post(
      `${STAFF_URL}/homework/create_update_homework`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const getHomework = async (body, token) => {
  try {
    const response = await axios.post(
      `${STAFF_URL}/homework/get_homework`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const deleteHomework = async (id, token) => {
  try {
    const response = await axios.post(
      `${STAFF_URL}/homework/delete_homework/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const getbyidHomework = async (body, token) => {
  try {
    const response = await axios.post(
      `${STAFF_URL}/homework/get_homework_by_id`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
//  Exam
export const createExam = async (body, token) => {
  try {
    const response = await axios.post(
      `${EXAM_URL}/examType/create_update_examType`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const getExam = async (body, token) => {
  try {
    const response = await axios.post(
      `${EXAM_URL}/examType/get_examType`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const getbyidExam = async (body, token) => {
  try {
    const response = await axios.post(
      `${EXAM_URL}/examType/get_examTypeById`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const deletetExam = async (id, token) => {
  try {
    const response = await axios.post(
      `${EXAM_URL}/examType/delete_examType/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const createExamreport = async (body, token) => {
  try {
    const response = await axios.post(
      `${EXAM_URL}/examReport/post_examsubjectReport`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const getExamreport = async (body, token) => {
  try {
    const response = await axios.post(
      `${EXAM_URL}/examReport/get_examReportList`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const getbyidExamreport = async (body, token) => {
  try {
    const response = await axios.post(
      `${EXAM_URL}/examReport/get_examReportListById`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const createExamresult = async (body, token) => {
  try {
    const response = await axios.post(
      `${EXAM_URL}/examReport/post_examResult`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const createExamReport = async (body, token) => {
  try {
    const response = await axios.post(
      `${EXAM_URL}/examReport/post_examResult`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const getExamResultlist = async (body, token) => {
  try {
    const response = await axios.post(
      `${EXAM_URL}/examReport/get_examResultList`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
//  Exam Portion
export const createExamportion = async (body, token) => {
  try {
    const response = await axios.post(
      `${EXAM_URL}/examPortion/create_update_examPortion`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const getexamPortion = async (body, token) => {
  try {
    const response = await axios.post(
      `${EXAM_URL}/examPortion/get_examPortion`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const getbyidExamportion = async (body, token) => {
  try {
    const response = await axios.post(
      `${EXAM_URL}/examPortion/get_examPortionById`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const deletetExamportion = async (id, token) => {
  try {
    const response = await axios.post(
      `${EXAM_URL}/examPortion/delete_examPortion/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
//  Events
export const createEvent = async (body, token) => {
  try {
    const response = await axios.post(
      `${STAFF_URL}/events/create_update_events`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const getEvent = async (body, token) => {
  try {
    const response = await axios.post(`${STAFF_URL}/events/get_events`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const getbyidEvents = async (body, token) => {
  try {
    const response = await axios.post(
      `${STAFF_URL}/events/get_eventsById`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const deletetEvents = async (id, token) => {
  try {
    const response = await axios.post(
      `${STAFF_URL}/events/delete_events/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const createEventImage = async (body, token) => {
  try {
    const response = await axios.post(
      `${STAFF_URL}/events/create_update_eventsImage`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
//   Grade
export const createOverallgrade = async (body, token) => {
  try {
    const response = await axios.post(
      `${GRADE_URL}/examReport_grade/post_overAllGrade`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const getOverallgeade = async (body, token) => {
  try {
    const response = await axios.post(
      `${GRADE_URL}/examReport_grade/get_overAllGrade`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const deletetOvergrade = async (id, token) => {
  try {
    const response = await axios.post(
      `${GRADE_URL}/examReport_grade/delete_overAllGrade/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const getbyidAllgrade = async (body, token) => {
  try {
    const response = await axios.post(
      `${GRADE_URL}/examReport_grade/get_overAllGradeByMark`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const createSubjectgrade = async (body, token) => {
  try {
    const response = await axios.post(
      `${GRADE_URL}/examReport_grade/post_subjectWiseGrade`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const getSubjectgrade = async (body, token) => {
  try {
    const response = await axios.post(
      `${GRADE_URL}/examReport_grade/get_subjectWiseGrade`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const getbyidSubjectgrade = async (body, token) => {
  try {
    const response = await axios.post(
      `${GRADE_URL}/examReport_grade/get_subjectWiseGradeByMark`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const deletetSubjectgrade = async (id, token) => {
  try {
    const response = await axios.post(
      `${GRADE_URL}/examReport_grade/delete_subjectWiseGrade/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
//   Attendance
export const staffViewAttendance = async (body, token) => {
  try {
    const response = await axios.post(
      `${STAFF_URL}/attendance/get_staff_attendance_view`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const createStaffAttendance = async (body, token) => {
  try {
    const response = await axios.post(
      `${STAFF_URL}/attendance/create_staff_attendance`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const createStudentAttendance = async (body, token) => {
  try {
    const response = await axios.post(
      `${STAFF_URL}/attendance/create_student_attendance`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const getViewAttendance = async (body, token) => {
  try {
    const response = await axios.post(
      `${STAFF_URL}/attendance/get_student_attendance_view`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
//   Stationery
export const getstudentStationerys = async (body, token) => {
  try {
    const response = await axios.post(
      `${STATIONERY_URL}/stationery/get_student_stationery`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const updatestudentStationerys = async (body, token) => {
  try {
    const response = await axios.post(
      `${STATIONERY_URL}/stationery/update_stationery_details`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const getclassList = async (body, token) => {
  try {
    const response = await axios.post(
      `${MASTER_URL}/academic/get_classList`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const getsectionList = async (body, token) => {
  try {
    const response = await axios.post(
      `${MASTER_URL}/academic/get_sectionList`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const createStudent = async (body, token) => {
  console.log(body)
  try {
    const response = await axios.post(
      `http://192.168.0.11:1010/admin/registration/studentRegistration`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const updateStudent = async (body, token) => {
  try {
    const response = await axios.post(
      `${ADMIN_URL}/admin/registration/studentDetailsUpdate`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const createStudentnumber = async (body, token) => {
  try {
    const response = await axios.post(
      `${ADMIN_URL}/admin/registration/studentCertificateNumber`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const createStudentImage = async (body, token) => {
  try {
    const response = await axios.post(
      `${ADMIN_URL}/uploadImage/studentImage`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const createStudentcommuity = async (body, token) => {
  try {
    const response = await axios.post(
      `${ADMIN_URL}/uploadImage/studentCommunityCert`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const createStudentadhar = async (body, token) => {
  try {
    const response = await axios.post(
      `${ADMIN_URL}/uploadImage/studentAdharCard`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const createStudentbirth = async (body, token) => {
  try {
    const response = await axios.post(
      `${ADMIN_URL}/uploadImage/studentBirthCertificate`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const createStudenttc = async (body, token) => {
  try {
    const response = await axios.post(
      `${ADMIN_URL}/uploadImage/studentTcCertificate `,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const getQualification = async (body, token) => {
  try {
    const response = await axios.post(
      "http://49.207.183.18:8089/religion_master/get_qualification",
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const deletetAadhar = async (id, token) => {
  console.log(id, "89");
  try {
    const response = await axios.post(
      `${ADMIN_URL}/uploadImage/removeAadharImage`,
      { studentId: id.studentId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
