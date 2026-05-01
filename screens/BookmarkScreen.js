import React, { useEffect, useState } from "react";
import { View, Text, Button, ScrollView } from "react-native";
import API from "../services/api";

export default function BookmarkScreen({ token, setScreen }) {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetchBookmarks();
  }, []);
  console.log("TOKEN in bookmark screen:", token);

  const fetchBookmarks = async () => {
    try {
      const res = await API.get("/jobs/bookmarks", {
        headers: { Authorization: token }
      });
      setJobs(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <ScrollView>
      <Button title="Back to Home" onPress={() => setScreen("home")} />

      {jobs.map((job) => (
        <Text key={job._id}>{job.title}</Text>
      ))}
    </ScrollView>
  );
}