import axios from "axios";

const MASTER_URL = process.env.REACT_APP_MASTER_URL;
const DAILY_URL = process.env.REACT_APP_DAILY_URL;
const LOGIN_URL = process.env.REACT_APP_LOGIN_URL;
const ADMIN_URL = process.env.REACT_APP_ADMIN_URL;
const STATIONERY_URL = process.env.REACT_APP_FEES_URL;
const STAFF_URL = process.env.REACT_APP_DAILY_URL;
const EXAM_URL = process.env.REACT_APP_EXAM_URL;
const GRADE_URL = process.env.REACT_APP_MASTER_URL;

export const API_BASE_URLS = {
  MASTER_URL,
  DAILY_URL,
  LOGIN_URL,
  ADMIN_URL,
  STATIONERY_URL,
  EXAM_URL,
};

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
  console.log("State API called with body:", body);
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
    console.log("State API response:", response.data);
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
    console.log("Nationality API response:", response.data.data);
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
export const getPeriodSlot = async (classId, token) => {
  try {
    const response = await axios.get(`${DAILY_URL}/timetable/get_period_slot/${classId}`, {
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
    id: body.id !== undefined && body.id !== null ? Number(body.id) : 0,
    classId: Number(body.classId),
    sectionId: Number(body.sectionId),
    totalCount: parseInt(body.totalCount, 10),
  };
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
    return response.data;
  } catch (error) {
    console.error("Error posting class section map:", error);
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
export const updateStaff = async (body, token) => {
  try {
    const response = await axios.put(
      `${ADMIN_URL}/admin/registration/staff_update`,
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
    console.error("Error updating staff:", error);
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
const flattenStudentRows = (rows) => {
  let list = Array.isArray(rows) ? [...rows] : [];
  while (list.length === 1 && Array.isArray(list[0])) {
    list = list[0];
  }
  return list.filter((row) => row && typeof row === "object" && !Array.isArray(row));
};

const normalizeStudentListResponse = (raw) => {
  if (!raw) return { status: "error", message: "", data: [] };

  let rows = [];
  if (Array.isArray(raw)) {
    rows = flattenStudentRows(raw);
  } else if (Array.isArray(raw.data)) {
    rows = flattenStudentRows(raw.data);
  } else if (Array.isArray(raw?.data?.data)) {
    rows = flattenStudentRows(raw.data.data);
  } else if (raw.data && typeof raw.data === "object") {
    rows = flattenStudentRows(Object.values(raw.data));
  } else if (raw.id || raw.admissionNo || raw.studentName) {
    rows = [raw];
  }

  const status = String(raw.status || (rows.length ? "success" : "")).toLowerCase();

  return {
    status: status || (rows.length ? "success" : "error"),
    message: raw.message || "",
    data: rows,
  };
};

export const getStudentlist = async (data, token) => {
  try {
    const body = {
      userName: data?.userName !== undefined && data?.userName !== null ? data.userName : 0,
      classId: data?.classId !== undefined && data?.classId !== null ? data.classId : 0,
      sectionId: data?.sectionId !== undefined && data?.sectionId !== null ? data.sectionId : 0,
    };
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
    return normalizeStudentListResponse(response.data);
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
  };
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
    reason_for_releaving: body.reason_for_releaving,
  };
  console.log("love", body);
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
  try {
    const response = await axios.post(
      `${ADMIN_URL}/admin/registration/studentRegistration`,
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
    let data = body;
    if (!(body instanceof FormData)) {
      data = new FormData();
      data.append("id", body.id);
      data.append("photoUrl", body.photoUrl);
    }
    const response = await axios.post(
      `${ADMIN_URL}/uploadImage/studentImage`,
      data,
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
    let data = body;
    if (!(body instanceof FormData)) {
      data = new FormData();
      data.append("id", body.id);
      data.append("photoUrl", body.photoUrl);
    }
    const response = await axios.post(
      `${ADMIN_URL}/uploadImage/studentCommunityCert`,
      data,
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
    let data = body;
    if (!(body instanceof FormData)) {
      data = new FormData();
      data.append("id", body.id);
      data.append("photoUrl", body.photoUrl);
    }
    const response = await axios.post(
      `${ADMIN_URL}/uploadImage/studentAdharCard`,
      data,
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
    let data = body;
    if (!(body instanceof FormData)) {
      data = new FormData();
      data.append("id", body.id);
      data.append("photoUrl", body.photoUrl);
    }
    const response = await axios.post(
      `${ADMIN_URL}/uploadImage/studentBirthCertificate`,
      data,
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
    let data = body;
    if (!(body instanceof FormData)) {
      data = new FormData();
      data.append("id", body.id);
      data.append("photoUrl", body.photoUrl);
    }
    const response = await axios.post(
      `${ADMIN_URL}/uploadImage/studentTcCertificate`,
      data,
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
      `${MASTER_URL}/religion_master/get_qualification`,
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

export const getAdminDashboardSummary = async (token) => {
  const response = await axios.get(`${ADMIN_URL}/admin/dashboard/get_summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getStaffDashboardSummary = async (token) => {
  const response = await axios.post(`${DAILY_URL}/dashboard/get_staff_summary`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getAcademicYear = async (token) => {
  const response = await axios.post(
    `${ADMIN_URL}/admin/academicYear/get_academicYear`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const createAcademicYear = async (body, token) => {
  const response = await axios.post(
    `${ADMIN_URL}/admin/academicYear/create_academicYear`,
    body,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const updateAcademicYear = async (body, token) => {
  const response = await axios.post(
    `${ADMIN_URL}/admin/academicYear/update_academicYear`,
    body,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// ─── Notifications ───────────────────────────────────────────────────────────
// Student: get notifications for own class/section (uses req.user.classId/sectionId)
export const getNotifications = async (token) => {
  const response = await axios.get(`${DAILY_URL}/notification/get_notification`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Staff/Admin: create notification for a class/section
export const createNotification = async (body, token) => {
  const response = await axios.post(
    `${DAILY_URL}/notification/create_notification`,
    body,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// Admin: delete notification
export const deleteNotification = async (id, token) => {
  const response = await axios.delete(
    `${DAILY_URL}/notification/delete_notification/${id}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// All: update notification read timestamp
export const updateNotificationTime = async (token) => {
  const response = await axios.post(
    `${DAILY_URL}/notification/update_notification`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// // All roles: get leave types list
// export const getLeaveTypes = async (token) => {
//   const response = await axios.get(`${DAILY_URL}/leave/get_leaveType`, {
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   return response.data;
// };

// Admin: create/update leave type
export const createLeaveType = async (body, token) => {
  const response = await axios.post(
    `${DAILY_URL}/leave/create_leaveType`,
    body,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// Admin: delete leave type
export const deleteLeaveType = async (id, token) => {
  const response = await axios.delete(
    `${DAILY_URL}/leave/delete_leaveType/${id}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// Student: get own leave list (uses req.user.classId/sectionId/userName)
export const getStudentLeave = async (token, classId = 0, sectionId = 0) => {
  const response = await axios.post(`${DAILY_URL}/leave/get_student_leave`,
    { classId, sectionId },
    { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
  );
  return response.data;
};

// Student: apply for leave
export const createStudentLeave = async (body, token) => {
  const response = await axios.post(
    `${DAILY_URL}/leave/create_student_leave`,
    body,
    { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
  );
  return response.data;
};

// Staff/Admin: approve or reject student leave
export const updateStudentLeaveStatus = async (body, token) => {
  const response = await axios.post(
    `${DAILY_URL}/leave/update_student_leave_status`,
    body,
    { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
  );
  return response.data;
};

// Student: update homework completion progress
export const updateHomeworkProgress = async (body, token) => {
  const response = await axios.post(
    `${DAILY_URL}/homework/update_homework_progress`,
    body,
    { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
  );
  return response.data;
};

// Student: update assignment completion progress
export const updateAssignmentProgress = async (body, token) => {
  const response = await axios.post(
    `${DAILY_URL}/assignment/update_assignment_progress`,
    body,
    { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
  );
  return response.data;
};

// Student: delete own leave application
export const deleteStudentLeave = async (body, token) => {
  const response = await axios.delete(`${DAILY_URL}/leave/delete_student_leave`, {
    headers: { Authorization: `Bearer ${token}` },
    data: body,
  });
  return response.data;
};

// Staff: get own leave list (uses req.user.userName + role)
export const getStaffLeave = async (token) => {
  const response = await axios.get(`${DAILY_URL}/leave/get_staff_leave`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Staff: apply for leave
export const createStaffLeave = async (body, token) => {
  const response = await axios.post(
    `${DAILY_URL}/leave/create_staff_leave`,
    body,
    { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
  );
  return response.data;
};

// Staff: delete own leave application
export const deleteStaffLeave = async (body, token) => {
  const response = await axios.delete(`${DAILY_URL}/leave/delete_staff_leave`, {
    headers: { Authorization: `Bearer ${token}` },
    data: body,
  });
  return response.data;
};

// Admin: approve or reject staff leave
export const updateStaffLeaveStatus = async (body, token) => {
  const response = await axios.post(
    `${DAILY_URL}/leave/update_staff_leave_status`,
    body,
    { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
  );
  return response.data;
};

// ─── Teacher ─────────────────────────────────────────────────────────────────
// Student: get subject teachers for student's class/section (uses req.user.classId/sectionId)
export const getTeacher = async (token) => {
  const response = await axios.get(`${DAILY_URL}/teacher/get_Teacher`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Staff: get classes assigned to the logged-in teacher (uses req.user.userName)
export const getTeacherClass = async (token) => {
  const response = await axios.get(`${DAILY_URL}/teacher/get_Teacher_class`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getSubjectClass = async (body, token) => {
  const response = await axios.post(
    `${DAILY_URL}/teacher/get_Subject_class`,
    body,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// ─── Staff Timetable (Staff: uses req.user.userName + body.dayId) ─────────────
export const getStaffTimetable = async (body, token) => {
  const response = await axios.post(
    `${DAILY_URL}/timetable/get_staff_timetable`,
    body,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// ─── Student Attendance ───────────────────────────────────────────────────────
// Staff+Student: get monthly attendance summary (role check in controller)
export const getStdAttendance = async (body, token) => {
  const response = await axios.post(
    `${DAILY_URL}/attendance/get_student_attendance`,
    body,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// Admin: view staff attendance by staffId + date
export const getStaffAttendanceView = async (body, token) => {
  const response = await axios.post(
    `${DAILY_URL}/attendance/get_staff_attendance_view`,
    body,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// ─── Assignment Status ────────────────────────────────────────────────────────
// Staff/Admin: toggle assignment open/closed status
export const updateAssignmentStatus = async (id, token) => {
  const response = await axios.post(
    `${DAILY_URL}/assignment/update_assignment_status/${id}`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// Student: get assignments for student's class/section (uses req.user.classId/sectionId)
export const getStudentAssignment = async (token) => {
  const response = await axios.get(
    `${DAILY_URL}/assignment/get_assignment`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// ─── Auth / Menu ───────────────────────────────────────────────────────────────
export const forgotPassword = async (userName) => {
  const response = await axios.post(`${LOGIN_URL}/user/forgotPassword`, { userName });
  return response.data;
};

export const verifyOtp = async (body) => {
  const response = await axios.post(`${LOGIN_URL}/user/verifyOtp`, body);
  return response.data;
};

export const updatePassword = async (body) => {
  const response = await axios.post(`${LOGIN_URL}/user/updatePassword`, body);
  return response.data;
};

export const changePassword = async (body, token) => {
  const response = await axios.post(`${LOGIN_URL}/password/changePassword`, body, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getMenu = async (token) => {
  const response = await axios.get(`${LOGIN_URL}/menu/getMenu`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getSubMenu = async (id, token) => {
  const response = await axios.get(`${LOGIN_URL}/menu/getSubMenu/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// ─── Transport Extended ───────────────────────────────────────────────────────
export const getFleetOverview = async (token) => {
  const response = await axios.get(`${STATIONERY_URL}/transport/fleet/get_overview`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getTransportRoutes = async (token) => {
  const response = await axios.get(`${STATIONERY_URL}/transport/route/get_routes`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const postTransportRoute = async (body, token) => {
  const response = await axios.post(`${STATIONERY_URL}/transport/route/post_route`, body, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(response.data, "response");
  return response.data;
};

export const deleteTransportRoute = async (id, token) => {
  const response = await axios.post(`${STATIONERY_URL}/transport/route/delete_route/${id}`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(response.data, "response");
  return response.data;
};

export const postTransportVehicle = async (body, token) => {
  const response = await axios.post(`${STATIONERY_URL}/transport/vehicle/post_vehicle`, body, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteTransportVehicle = async (id, token) => {
  const response = await axios.post(`${STATIONERY_URL}/transport/vehicle/delete_vehicle/${id}`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const postTransportDriver = async (body, token) => {
  const response = await axios.post(`${STATIONERY_URL}/transport/driver/post_driver`, body, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getStudentTransportAllocations = async (body, token) => {
  const response = await axios.post(`${STATIONERY_URL}/transport/student/get_allocations`, body || {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const postStudentTransportAllocation = async (body, token) => {
  const response = await axios.post(`${STATIONERY_URL}/transport/student/post_allocation`, body, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteStudentTransportAllocation = async (id, token) => {
  const response = await axios.post(`${STATIONERY_URL}/transport/student/delete_allocation/${id}`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getTransportFeeSummary = async (token) => {
  const response = await axios.get(`${STATIONERY_URL}/transport/fee/get_summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateTransportFeeStatus = async (body, token) => {
  const response = await axios.post(`${STATIONERY_URL}/transport/fee/update_status`, body, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getExamReportData = async (body, token) => {
  const response = await axios.post(`${EXAM_URL}/reports/exam/get_report`, body, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getExamReportStudentWise = async (body, token) => {
  const response = await axios.post(`${EXAM_URL}/reports/exam/get_student_wise`, body, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getExamReportClassWise = async (body, token) => {
  const response = await axios.post(`${EXAM_URL}/reports/exam/get_class_wise`, body, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getExamReportSubjectWise = async (body, token) => {
  const response = await axios.post(`${EXAM_URL}/reports/exam/get_subject_wise`, body, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const exportExamReportCsv = async (body, token) => {
  const response = await axios.post(`${EXAM_URL}/reports/exam/export`, body, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getAssignmentReportData = async (body, token) => {
  const response = await axios.post(`${DAILY_URL}/reports/assignment/get_report`, body, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const exportAssignmentReportCsv = async (body, token) => {
  const response = await axios.post(`${DAILY_URL}/reports/assignment/export`, body, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getAssignmentReportClassWise = async (body, token) => {
  const response = await axios.post(`${DAILY_URL}/reports/assignment/get_class_wise`, body, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getAssignmentReportSubjectWise = async (body, token) => {
  const response = await axios.post(`${DAILY_URL}/reports/assignment/get_subject_wise`, body, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getAssignmentReportStudentWise = async (body, token) => {
  const response = await axios.post(`${DAILY_URL}/reports/assignment/get_student_wise`, body, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getReportsOverview = async (body, token) => {
  const response = await axios.post(`${DAILY_URL}/reports/get_overview`, body, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getAttendanceMonthlyReport = async (body, token) => {
  const response = await axios.post(`${DAILY_URL}/reports/attendance/get_student_monthly`, body, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getAttendanceDailyReport = async (body, token) => {
  const response = await axios.post(`${DAILY_URL}/reports/attendance/get_class_daily`, body, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const exportAttendanceReportCsv = async (body, token) => {
  const response = await axios.post(`${DAILY_URL}/reports/attendance/export`, body, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getHomeworkReportData = async (body, token) => {
  const response = await axios.post(`${DAILY_URL}/reports/homework/get_report`, body, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const exportHomeworkReportCsv = async (body, token) => {
  const response = await axios.post(`${DAILY_URL}/reports/homework/export`, body, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getExamMarkReportData = async (body, token) => {
  const response = await axios.post(`${EXAM_URL}/reports/exam/get_mark_report`, body, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getExamReportFilters = async (body, token) => {
  const response = await axios.post(`${EXAM_URL}/reports/exam/get_filters`, body, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/* ─────────────────────────────────────────────────────────
   LEAVE MANAGEMENT
───────────────────────────────────────────────────────── */

/** GET /leave/get_leaveType — fetch all leave type options */
export const getLeaveTypes = async (token) => {
  try {
    const response = await axios.get(`${DAILY_URL}/leave/get_leaveType`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("getLeaveTypes error:", error);
    throw error;
  }
};

/** POST /leave/get_student_leave — fetch student leave records */
// export const getStudentLeave = async (token, classId = 0, sectionId = 0) => {
//   try {
//     const response = await axios.post(
//       `${DAILY_URL}/leave/get_student_leave`,
//       { classId, sectionId },
//       { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
//     );
//     return response.data;
//   } catch (error) {
//     console.error("getStudentLeave error:", error);
//     throw error;
//   }
// };

/** GET /leave/get_staff_leave — fetch staff leave records */
// export const getStaffLeave = async (token) => {
//   try {
//     const response = await axios.get(`${DAILY_URL}/leave/get_staff_leave`, {
//       headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
//     });
//     return response.data;
//   } catch (error) {
//     console.error("getStaffLeave error:", error);
//     throw error;
//   }
// };

/** POST /leave/create_student_leave — submit a student leave application */
// export const createStudentLeave = async (body, token) => {
//   try {
//     const response = await axios.post(
//       `${DAILY_URL}/leave/create_student_leave`,
//       body,
//       { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
//     );
//     return response.data;
//   } catch (error) {
//     console.error("createStudentLeave error:", error);
//     throw error;
//   }
// };

/** POST /leave/create_staff_leave — submit a staff / admin leave application */
// export const createStaffLeave = async (body, token) => {
//   try {
//     const response = await axios.post(
//       `${DAILY_URL}/leave/create_staff_leave`,
//       body,
//       { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
//     );
//     return response.data;
//   } catch (error) {
//     console.error("createStaffLeave error:", error);
//     throw error;
//   }
// };

/** POST /leave/update_student_leave_status — approve or reject a student leave */
// export const updateStudentLeaveStatus = async (body, token) => {
//   try {
//     const response = await axios.post(
//       `${DAILY_URL}/leave/update_student_leave_status`,
//       body,
//       { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
//     );
//     return response.data;
//   } catch (error) {
//     console.error("updateStudentLeaveStatus error:", error);
//     throw error;
//   }
// };

/** POST /leave/update_staff_leave_status — approve or reject a staff leave */
// export const updateStaffLeaveStatus = async (body, token) => {
//   try {
//     const response = await axios.post(
//       `${DAILY_URL}/leave/update_staff_leave_status`,
//       body,
//       { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
//     );
//     return response.data;
//   } catch (error) {
//     console.error("updateStaffLeaveStatus error:", error);
//     throw error;
//   }
// };
