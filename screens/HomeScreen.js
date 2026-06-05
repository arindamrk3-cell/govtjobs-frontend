import * as Notifications from "expo-notifications";
import React, { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TextInput, Share, KeyboardAvoidingView, Platform } from "react-native";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Linking,
  FlatList,
  RefreshControl,

} from "react-native";
import { Animated } from "react-native";
import { useRef } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import API from "../services/api";
import { Ionicons } from "@expo/vector-icons";
import ChatModal from "../components/ChatModal";

const FILTER_STATES = [
  "All India", "West Bengal", "Delhi", "Maharashtra",
  "Uttar Pradesh", "Tamil Nadu", "Gujarat", "Karnataka",
  "Rajasthan", "Bihar", "Odisha", "Punjab", "Haryana",
];

const FILTER_QUALS = [
  "8th Pass", "10th Pass", "12th Pass", "ITI",
  "Diploma", "Graduation", "B.Tech / BE", "MBA",
];

// ─── DEADLINE COUNTDOWN ───────────────────────────────────────────────────────
function getDeadlineLabel(last_date) {
  const now = new Date();
  const end = new Date(last_date);
  const diff = end - now;
  if (diff <= 0) return { label: "Expired", urgent: true };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return { label: "Closes today!", urgent: true };
  if (days === 1) return { label: "1 day left", urgent: true };
  if (days <= 7) return { label: `${days} days left`, urgent: true };
  return { label: `Closes ${end.toDateString()}`, urgent: false };
}
// ─── JOB CARD COMPONENT ───────────────────────────────────────────────────────
function JobSkeleton() {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.cardNew, { opacity }]}>
      <View style={[styles.jobCard, { backgroundColor: "rgba(255,255,255,0.08)" }]}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
          <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.15)" }} />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <View style={{ width: "75%", height: 14, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.15)", marginBottom: 8 }} />
            <View style={{ width: "50%", height: 11, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.10)" }} />
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
          <View style={{ width: 80, height: 26, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.10)" }} />
          <View style={{ width: 70, height: 26, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.10)" }} />
        </View>
        <View style={{ height: 1, backgroundColor: "rgba(255,255,255,0.08)", marginBottom: 12 }} />
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ width: 100, height: 13, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.10)" }} />
          <View style={{ width: 100, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.10)" }} />
        </View>
      </View>
    </Animated.View>
  );
}
function JobCard({ job, onPress, onBookmark, onApply }) {
  const { label, urgent } = getDeadlineLabel(job.last_date);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <View style={styles.cardNew}>
        <View style={styles.jobCard}>
          <View style={styles.cardTop}>
            <View style={styles.orgIcon}>
              <Text style={styles.orgText}>
                {job.organization?.slice(0, 2).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle} numberOfLines={1}>{job.title}</Text>
              <Text style={styles.cardOrg} numberOfLines={1}>{job.organization}</Text>
            </View>
            <TouchableOpacity style={styles.bookmarkIcon} onPress={onBookmark}>
              <Ionicons name="bookmark-outline" size={20} color="#000000" />
            </TouchableOpacity>
          </View>

          <View style={styles.tagsRow}>
            <Text style={styles.tag} numberOfLines={1}>{job.qualification}</Text>
            <Text style={styles.tagState} numberOfLines={1}>{job.state}</Text>
            {urgent && (
              <View style={styles.urgentBadge}>
                <Text style={styles.urgentText}>⚡ Urgent</Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.footer}>
            <View style={styles.dateRow}>
              <Ionicons
                name="calendar-outline"
                size={14}
                color={urgent ? C.danger : C.textMid}
              />
              <Text style={[styles.dateText, !urgent && { color: C.textMid }]}>
                {label}
              </Text>
            </View>
            <TouchableOpacity style={styles.applyBtn} onPress={onApply}>
              <Text style={styles.applyText}>Apply now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── RECENTLY VIEWED MINI CARD ────────────────────────────────────────────────
function RecentCard({ job, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <View style={styles.recentCard}>
        <View style={styles.recentOrgIcon}>
          <Text style={styles.recentOrgText}>
            {job.organization?.slice(0, 2).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.recentTitle} numberOfLines={1}>{job.title}</Text>
        <Text style={styles.recentOrg} numberOfLines={1}>{job.organization}</Text>
        <View style={styles.recentFooter}>
          <Ionicons name="calendar-outline" size={11} color={C.danger} />
          <Text style={styles.recentDate}>
            {getDeadlineLabel(job.last_date).label}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function HomeScreen({ token, setScreen, setSelectedJob, getPushToken, filter, dailyQuizMode, setDailyQuizMode, showDailyQuiz, setShowDailyQuiz }) {
  const insets = useSafeAreaInsets();
  const [jobs, setJobs] = useState([]);
  const [allJobsBackup, setAllJobsBackup] = useState([]);
  const [forYouJobs, setForYouJobs] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [newTodayCount, setNewTodayCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // "all" | "foryou"
  const [selectedState, setSelectedState] = useState(null);
  const [selectedQual, setSelectedQual] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showDot, setShowDot] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  
  

  const LIMIT = 10;

  const scrollY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const headerVisible = useRef(new Animated.Value(1)).current;

  const HEADER_HEIGHT = 60;
  const SEARCH_HEIGHT = 75;

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event) => {
        const currentY = event.nativeEvent.contentOffset.y;
        const diff = currentY - lastScrollY.current;

        if (diff > 4 && currentY > 60) {
          // Scrolling DOWN — hide header
          Animated.timing(headerVisible, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
          }).start();
        } else if (diff < -4) {
          // Scrolling UP even a little — show header instantly
          Animated.timing(headerVisible, {
            toValue: 1,
            duration: 150,
            useNativeDriver: false,
          }).start();
        }
        lastScrollY.current = currentY;
      },
    }
  );

  const headerTranslateY = headerVisible.interpolate({
    inputRange: [0, 1],
    outputRange: [-(HEADER_HEIGHT + SEARCH_HEIGHT), 0],
  });

  const loadCachedJobs = async () => {
    try {
      const cached = await AsyncStorage.getItem("cachedJobs");

      if (cached) {
        const parsed = JSON.parse(cached);

        setJobs(parsed);
        setAllJobsBackup(parsed);
        loadRecentlyViewed(parsed);
      }
    } catch (err) {
      console.log("Cache load error:", err);
    }
  };

  const searchTimeout = useRef(null);
  const fetchingRef = useRef(false);
  const fetchJobs = async (stateF = selectedState, qualF = selectedQual, pageNum = 1) => {
    if (fetchingRef.current) return;

    fetchingRef.current = true;
    try {
      if (pageNum === 1) setLoading(true);
      let url = `/jobs?page=${pageNum}&limit=${LIMIT}`;
      if (stateF) url += `&state=${encodeURIComponent(stateF)}`;
      if (qualF) url += `&qualification=${encodeURIComponent(qualF)}`;

      const res = await API.get(url);
      const newJobs = res.data;

      // if (pageNum === 1) {
      //   setJobs(newJobs);
      //   loadRecentlyViewed(newJobs);
      // }




      if (pageNum === 1) {
        if (newJobs && newJobs.length > 0) {

          setJobs(newJobs);
          if (pageNum === 1) {
            setAllJobsBackup(newJobs);
            await AsyncStorage.setItem(
              "cachedJobs",
              JSON.stringify(newJobs)
            );

          }
          loadRecentlyViewed(newJobs);
        }
      } else {
        setJobs(prev => [...prev, ...newJobs]);
      }
      setHasMore(newJobs.length === LIMIT);
      setPage(pageNum);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (pageNum === 1) {
        const todayCount = res.data.filter(
          j => new Date(j.created_at) >= today
        ).length;
        setNewTodayCount(todayCount);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setTimeout(() => {
        setLoading(false);
        setLoadingMore(false);
        fetchingRef.current = false;
      }, 800);
    }
  };
  const loadMore = async () => {
    if (!hasMore || loadingMore || activeTab === "foryou") return;
    setLoadingMore(true);
    await fetchJobs(selectedState, selectedQual, page + 1);
  };

  const onRefresh = async () => {
    setRefreshing(true);

    await fetchJobs(selectedState, selectedQual, 1);

    setRefreshing(false);
  };

  const applyStateFilter = (s) => {
    const val = selectedState === s ? null : s;
    setSelectedState(val);
    setPage(1);
    setHasMore(true);
    fetchJobs(val, selectedQual, 1);
  };

  const applyQualFilter = (q) => {
    const val = selectedQual === q ? null : q;
    setSelectedQual(val);
    setPage(1);
    setHasMore(true);
    fetchJobs(selectedState, val, 1);
  };

  const clearFilters = () => {
    setSelectedState(null);
    setSelectedQual(null);
    setPage(1);
    setHasMore(true);
    fetchJobs(null, null, 1);
  };

  // ── Fetch For You jobs ──────────────────────────────────────────────────────
  const fetchForYou = async () => {
    try {
      //console.log("fetchForYou called, token:", token ? "exists" : "missing");
      const res = await API.get("/jobs/foryou", {
        headers: { Authorization: `Bearer ${token}` },
      });
      //console.log(res.data);
      //console.log("ForYou jobs:", res.data.length);
      setForYouJobs(res.data);
    } catch (err) {
      console.log("ForYou error:", err.response?.data);
    }
  };

  // ── Recently Viewed ─────────────────────────────────────────────────────────
  const loadRecentlyViewed = async (activeJobs) => {
    try {
      const raw = await AsyncStorage.getItem("recentlyViewed");
      if (!raw) return;
      let recent = JSON.parse(raw);
      if (activeJobs && activeJobs.length > 0) {

        const activeIds = new Set(activeJobs.map(j => j._id));
        recent = recent.filter(j => activeIds.has(j._id));
        await AsyncStorage.setItem("recentlyViewed", JSON.stringify(recent));
        setRecentlyViewed(recent);
      }

    } catch (err) {
      console.log(err);
    }
  };

  const addToRecentlyViewed = async (job) => {
    try {
      const raw = await AsyncStorage.getItem("recentlyViewed");
      let recent = raw ? JSON.parse(raw) : [];
      // Remove if already exists
      recent = recent.filter(j => j._id !== job._id);
      // Add to front
      recent.unshift(job);
      // Keep only last 8
      recent = recent.slice(0, 10);
      await AsyncStorage.setItem("recentlyViewed", JSON.stringify(recent));
      setRecentlyViewed(recent);
    } catch (err) {
      console.log(err);
    }
  };

  const checkDailyQuizStatus = async () => {

    const savedDate =
      await AsyncStorage.getItem(
        "dailyQuizCompleted"
      );

    const today =
      new Date().toDateString();

    if (savedDate === today) {

      setShowDailyQuiz(false);

    } else {

      setShowDailyQuiz(true);

    }
  };



  useEffect(() => {

    checkDailyQuizStatus();
    // fetchStreak();

  }, []);
  useEffect(() => {

    loadCachedJobs();
    fetchJobs();
    setTimeout(() => fetchForYou(), 1500);

    Notifications.requestPermissionsAsync();

    const timeout = setTimeout(() => {
      checkNewContent();
    }, 4000);

    return () => clearTimeout(timeout);

  }, [filter]);





  // ── Search ──────────────────────────────────────────────────────────────────
  const searchJobs = async (text) => {
    setSearch(text);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (text.length === 0) {

      if (allJobsBackup.length > 0) {
        setJobs(allJobsBackup);
      }

      fetchJobs();

      return;
    }

    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await API.get("/jobs/search", { params: { keyword: text } });

        
        setJobs(res.data || []);
      } catch (err) {
        console.log(err);
      }
    }, 400);

  };
  useEffect(() => {

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, []);
  // ── Bookmark ────────────────────────────────────────────────────────────────
  const bookmark = async (id) => {
    try {
      await API.post(`/jobs/bookmark/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handleMorePress = async () => {
    setShowMore(p => !p);
    if (showDot) {
      setShowDot(false);
      await AsyncStorage.setItem("lastSeenMore", new Date().toISOString());
    }
  };
  const checkNewContent = async () => {
    try {

      const lastSeen = await AsyncStorage.getItem("lastSeenMore");
      const res = await API.get("/current-affairs/latest");
      const latestAt = res.data.latestAt;

      

      if (!latestAt) return;

      if (!lastSeen || new Date(latestAt) > new Date(lastSeen)) {
        setShowDot(true);
      } else {
        setShowDot(false);
      }
    } catch (err) {
      console.log("checkNewContent error:", err);
    }
  };

  // ── Open job detail ─────────────────────────────────────────────────────────
  const openJob = (job) => {
    addToRecentlyViewed(job);
    setSelectedJob(job);
    setScreen("detail");
  };

  const openLink = (url) => Linking.openURL(url);

  const displayedJobs = activeTab === "foryou" ? forYouJobs : jobs;



  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >

        {/* ── Animated Header ── */}
        <Animated.View style={[styles.header, { paddingTop: insets.top }, { transform: [{ translateY: headerTranslateY }] }]}>{/* { height: headerHeight } */}
          <View style={styles.headerLeft}>
            <View style={styles.logoDot}>
              <Ionicons name="briefcase" size={20} color="#ffffff" />
            </View>
            <View style={{ flex: 1 }}>
              <Animated.Text style={styles.headerTitle}>GovtJobs</Animated.Text>
              <Animated.Text style={styles.headerSub}>India's official listings</Animated.Text>
            </View>
          </View>
          <View style={styles.rightIcons}>
            <TouchableOpacity
              style={[styles.iconBtn, styles.activeBookmark]}
              onPress={() => setScreen("bookmark")}
            >
              <Ionicons name="bookmark" size={17} color="#1ba74e" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iconBtn, showMore && styles.iconBtnActive]}
              onPress={handleMorePress}
            >
              <Ionicons name="grid-outline" size={18} color="#c9bbbb" />
              {showDot && <View style={styles.notifDot} />}
            </TouchableOpacity>


          </View>
        </Animated.View>



        {/* ── More Options Dropdown ── */}
        {showMore && (
          <View style={[styles.dropdown, { top: insets.top + 58 }]}>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => { setShowMore(false); setScreen("quiz-category"); }}
            >
              <View style={[styles.dropdownIcon, { backgroundColor: "#FFF4E0" }]}>
                <Ionicons name="help-circle-outline" size={18} color="#F5A623" />
              </View>
              <View>
                <Text style={styles.dropdownTitle}>Quiz</Text>
                <Text style={styles.dropdownSub}>Test your knowledge</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.dropdownDivider} />

            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => { setShowMore(false); setScreen("current-affairs"); }}
            >
              <View style={[styles.dropdownIcon, { backgroundColor: "#EAF1FB" }]}>
                <Ionicons name="newspaper-outline" size={18} color="#2C5F96" />
              </View>
              <View>
                <Text style={styles.dropdownTitle}>Current Affairs</Text>
                <Text style={styles.dropdownSub}>Stay updated daily</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.dropdownDivider} />

            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => { setShowMore(false); setScreen("calendar"); }}
            >
              <View style={[styles.dropdownIcon, { backgroundColor: C.primaryMuted }]}>
                <Ionicons name="calendar-outline" size={18} color={C.primary} />
              </View>
              <View>
                <Text style={styles.dropdownTitle}>Exam Calendar</Text>
                <Text style={styles.dropdownSub}>View upcoming exams</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.dropdownDivider} />



            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => { setShowMore(false); setScreen("notes"); }}
            >
              <View style={[styles.dropdownIcon, { backgroundColor: C.primaryMuted }]}>
                <Ionicons name="book-outline" size={18} color={C.primary} />
              </View>
              <View>
                <Text style={styles.dropdownTitle}>Notes</Text>
                <Text style={styles.dropdownSub}>View your notes</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.dropdownDivider} />

            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setShowMore(false);
                setScreen("save-note");
              }}
            >
              <View
                style={[
                  styles.dropdownIcon,
                  { backgroundColor: "#EAF1FB" }
                ]}
              >
                <Ionicons
                  name="bookmark-outline"
                  size={18}
                  color="#2C5F96"
                />
              </View>

              <View>
                <Text style={styles.dropdownTitle}>
                  Saved Notes
                </Text>

                <Text style={styles.dropdownSub}>
                  Your bookmarked PDFs
                </Text>
              </View>
            </TouchableOpacity>



          </View>
        )}




        <Animated.View style={[
          styles.searchWrap,
          { transform: [{ translateY: headerTranslateY }] }
        ]}>
          <View style={styles.searchInner}>
            <Ionicons name="search" size={20} color="#888" />
            <TextInput
              placeholder="Search by title, org, or state…"
              placeholderTextColor="#888"
              value={search}
              onChangeText={searchJobs}
              style={styles.searchInput}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => { setSearch(""); fetchJobs(); }}>
                <Ionicons name="close-circle" size={18} color="#888" />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {showMore && (
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={() => setShowMore(false)}
          />
        )}
        
        {/* ── Scrollable Body ── */}
        <Animated.ScrollView keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{
            paddingTop: HEADER_HEIGHT + SEARCH_HEIGHT + 10,
            paddingBottom: 20
          }}
          scrollEventThrottle={30}
          onScroll={handleScroll}

          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}

              onRefresh={onRefresh}
              tintColor={C.primary}
              progressViewOffset={200}
            />
          }
        >

          {/* ── New Today Banner ── */}
          {newTodayCount > 0 && (
            <View style={styles.newTodayBanner}>
              <Ionicons name="flash" size={14} color="#fff" />
              <Text style={styles.newTodayText}>
                {newTodayCount} new job{newTodayCount > 1 ? "s" : ""} posted today
              </Text>
            </View>
          )}
          {/* ── Filter Chips ── */}
          <View style={styles.filterSection}>

            {/* Active filter summary + clear */}
            {(selectedState || selectedQual) && (
              <View style={styles.activeFilterRow}>
                <Ionicons name="filter" size={12} color={C.primary} />
                <Text style={styles.activeFilterText}>
                  {[selectedState, selectedQual].filter(Boolean).join(" · ")}
                </Text>
                <TouchableOpacity onPress={clearFilters} style={styles.clearBtn}>
                  <Ionicons name="close-circle" size={14} color={C.danger} />
                  <Text style={styles.clearBtnText}>Clear</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* State chips */}
            <FlatList
              data={FILTER_STATES}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={item => item}
              contentContainerStyle={styles.chipList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.filterChip, selectedState === item && styles.filterChipActive]}
                  onPress={() => applyStateFilter(item)}
                >
                  <Ionicons
                    name="location-outline"
                    size={11}
                    color={selectedState === item ? C.primary : "rgba(255,255,255,0.4)"}
                  />
                  <Text style={[styles.filterChipText, selectedState === item && styles.filterChipTextActive]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />

            {/* Qualification chips */}
            <FlatList
              data={FILTER_QUALS}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={item => item}
              contentContainerStyle={styles.chipList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.filterChip, selectedQual === item && styles.filterChipActive]}
                  onPress={() => applyQualFilter(item)}
                >
                  <Ionicons
                    name="school-outline"
                    size={11}
                    color={selectedQual === item ? C.primary : "rgba(255,255,255,0.4)"}
                  />
                  <Text style={[styles.filterChipText, selectedQual === item && styles.filterChipTextActive]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
          {/* ── Quick Access Row ── */}
          {/* <View style={styles.quickRow}>
            <TouchableOpacity
              style={[styles.quickCard, { borderLeftColor: "#2C5F96" }]}
              onPress={() => setScreen("current-affairs")}
              activeOpacity={0.85}
            >
              <View style={[styles.quickIcon, { backgroundColor: "#EAF1FB" }]}>
                <Ionicons name="newspaper-outline" size={20} color="#2C5F96" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.quickTitle}>Current Affairs</Text>
                <Text style={styles.quickSub}>Stay updated daily</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.3)" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickCard, { borderLeftColor: C.amber }]}
              onPress={() => setScreen("quiz")}
              activeOpacity={0.85}
            >
              <View style={[styles.quickIcon, { backgroundColor: "#FFF4E0" }]}>
                <Ionicons name="help-circle-outline" size={20} color={C.amber} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.quickTitle}>Daily Quiz</Text>
                <Text style={styles.quickSub}>Test your knowledge</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.3)" />
            </TouchableOpacity>
          </View> */}
         

          {showDailyQuiz && (
            <TouchableOpacity
              style={styles.dailyQuizCard}
              activeOpacity={0.9}
              onPress={() => {
                setDailyQuizMode(true);
                setScreen("quiz");
              }}>

              <View style={styles.dailyLeft}>

                <View style={styles.dailyIconWrap}>

                  <Ionicons
                    name="flame-outline"
                    size={24}
                    color="#FF7A00"
                  />

                </View>

                <View>

                  <Text style={styles.dailyTitle}>
                    Daily Quiz Challenge
                  </Text>

                  <Text style={styles.dailySub}>
                     Today's quiz is ready! Tap to start!
                  </Text>

                </View>

              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color="rgba(255,255,255,0.3)"
              />

            </TouchableOpacity>)}

          {/* ── Recently Viewed ── */}
          {recentlyViewed.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionLabel}>Recently Viewed</Text>
                <TouchableOpacity onPress={async () => {
                  await AsyncStorage.removeItem("recentlyViewed");
                  setRecentlyViewed([]);
                }}>
                  <Text style={styles.sectionAction}>Clear</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={recentlyViewed}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item._id}
                contentContainerStyle={{ paddingHorizontal: 14, gap: 10 }}
                renderItem={({ item }) => (
                  <RecentCard
                    job={item}
                    onPress={() => openJob(item)}
                  />
                )}
              />
            </View>
          )}

          {/* ── Tab Switcher: All Jobs / For You ── */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === "all" && styles.tabBtnActive]}
              onPress={() => setActiveTab("all")}
            >
              <Text style={[styles.tabText, activeTab === "all" && styles.tabTextActive]}>
                All Jobs
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === "foryou" && styles.tabBtnActive]}
              onPress={() => setActiveTab("foryou")}
            >
              <Ionicons
                name="sparkles"
                size={13}
                color={activeTab === "foryou" ? C.primary : "rgba(255,255,255,0.4)"}
              />
              <Text style={[styles.tabText, activeTab === "foryou" && styles.tabTextActive]}>
                For You
              </Text>
            </TouchableOpacity>
          </View>


          {/* ── Job List ── */}
          {/* {displayedJobs.length === 0 ? */}

          {loading && displayedJobs.length === 0 ? (
            <>
              <JobSkeleton />
              <JobSkeleton />
              <JobSkeleton />
              <JobSkeleton />
              <JobSkeleton />
            </>
          ) : displayedJobs.length === 0 ? (

            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={44} color="rgba(255,255,255,0.15)" />
              <Text style={styles.emptyText}>No jobs found</Text>
              <Text style={styles.emptySubText}>
                {activeTab === "foryou"
                  ? "Update your preferences in Profile"
                  : "Try a different search or filter"}
              </Text>
            </View>
          ) : (
            <>

              <FlatList
                data={displayedJobs}
                keyExtractor={(item) => item._id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <JobCard
                    job={item}
                    onPress={() => openJob(item)}
                    onBookmark={() => bookmark(item._id)}
                    onApply={() => openLink(item.link)}
                  />
                )}
              />

              {/* Load More */}
              {activeTab === "all" && (
                hasMore ? (
                  <TouchableOpacity
                    style={styles.loadMoreBtn}
                    onPress={loadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <ActivityIndicator size="small" color={C.primary} />
                    ) : (
                      <>
                        <Text style={styles.loadMoreText}>Load More</Text>
                        <Ionicons name="chevron-down" size={16} color={C.primary} />
                      </>
                    )}
                  </TouchableOpacity>
                ) : (
                  <View style={styles.noMoreWrap}>
                    <Text style={styles.noMoreText}>You've seen all jobs</Text>
                  </View>
                )
              )}
            </>
          )}



        </Animated.ScrollView>

        {/* Chat Floating Button */}
        <TouchableOpacity
          style={styles.chatFloatingButton}
          onPress={() => setChatVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="chatbox-ellipses" size={28} color={C.white} />
        </TouchableOpacity>

        {/* Chat Modal */}
        {chatVisible && (
          <ChatModal token={token} onClose={() => setChatVisible(false)} />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView >
  );
}

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  bg: "#0D1F1A",
  surface: "#FFFFFF",
  surfaceAlt: "#F4F7F5",
  primary: "#0A8C5F",
  primaryDark: "#076647",
  primaryMuted: "#E6F4EF",
  accent: "#F5A623",
  accentMuted: "#FFF4E0",
  stateTag: "#EAF1FB",
  stateBorder: "#A8C4E8",
  text: "#0D1F1A",
  textMid: "#4A6360",
  textLight: "#8FA8A2",
  border: "#DDE8E4",
  headerBg: "#0D1F1A",
  danger: "#C0392B",
  white: "#FFFFFF",
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  loader: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: C.bg },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
    overflow: "hidden", flexDirection: "row", alignItems: "center",
    justifyContent: "center", paddingHorizontal: 16, paddingBottom: 10,
    backgroundColor: C.headerBg, borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  logoDot: {
    width: 42, height: 42, borderRadius: 12, backgroundColor: C.primary,
    alignItems: "center", justifyContent: "center",
    shadowColor: C.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55, shadowRadius: 8, elevation: 6,
  },
  headerTitle: { marginLeft: 12, fontSize: 17, fontWeight: "700", color: C.white, letterSpacing: 0.3 },
  headerSub: { marginLeft: 12, fontSize: 14, color: "rgba(255,255,255,0.45)", marginTop: 1 },
  rightIcons: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.10)",
  },
  activeBookmark: {
    backgroundColor: "rgba(10,140,95,0.18)",
    borderColor: "rgba(10,140,95,0.35)",
  },

  // ── Search ──────────────────────────────────────────────────────────────────
  searchWrap: {
    position: "absolute", top: 84, left: 0, right: 0, zIndex: 9,
    paddingHorizontal: 16, paddingVertical: 6, backgroundColor: C.headerBg,
  },
  searchInner: {
    flexDirection: "row", backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 12, paddingHorizontal: 14, alignItems: "center",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.10)",
  },
  searchInput: { flex: 1, paddingVertical: 11, marginLeft: 10, fontSize: 14, color: C.white },

  // ── New Today Banner ─────────────────────────────────────────────────────────
  newTodayBanner: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: C.primary, marginHorizontal: 14,
    marginBottom: 14, paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 12,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35, shadowRadius: 6, elevation: 4,
  },
  newTodayText: { fontSize: 13, fontWeight: "700", color: C.white, letterSpacing: 0.2 },

  // ── Section ──────────────────────────────────────────────────────────────────
  section: { marginBottom: 16 },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 14, marginBottom: 10 },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.4)", letterSpacing: 1, textTransform: "uppercase" },
  sectionAction: { fontSize: 12, fontWeight: "600", color: C.primary },

  // ── Recently Viewed Card ──────────────────────────────────────────────────────
  recentCard: {
    width: 150, backgroundColor: C.surface, borderRadius: 14,
    padding: 12, borderWidth: 1, borderColor: C.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 3,
  },
  recentOrgIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: C.primaryMuted, alignItems: "center",
    justifyContent: "center", marginBottom: 8,
    borderWidth: 1, borderColor: "rgba(10,140,95,0.18)",
  },
  recentOrgText: { color: C.primary, fontWeight: "700", fontSize: 12 },
  recentTitle: { fontSize: 12, fontWeight: "700", color: C.text, lineHeight: 16, marginBottom: 3 },
  recentOrg: { fontSize: 11, color: C.textMid, marginBottom: 8, fontWeight: "500" },
  recentFooter: { flexDirection: "row", alignItems: "center", gap: 4 },
  recentDate: { fontSize: 10, fontWeight: "600", color: C.danger },

  // ── Tab Switcher ─────────────────────────────────────────────────────────────
  tabRow: {
    flexDirection: "row", marginHorizontal: 14,
    marginBottom: 12, gap: 8,
  },
  tabBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  tabBtnActive: {
    backgroundColor: C.primaryMuted,
    borderColor: "rgba(10,140,95,0.30)",
  },
  tabText: { fontSize: 13, fontWeight: "600", color: "rgba(255,255,255,0.4)" },
  tabTextActive: { color: C.primary },

  // ── Empty State ───────────────────────────────────────────────────────────────
  emptyState: { alignItems: "center", justifyContent: "center", paddingTop: 60, gap: 10 },
  emptyText: { fontSize: 16, fontWeight: "700", color: "rgba(255,255,255,0.3)" },
  emptySubText: { fontSize: 13, color: "rgba(255,255,255,0.18)", fontWeight: "500", textAlign: "center", paddingHorizontal: 30 },

  // ── Job Card ──────────────────────────────────────────────────────────────────
  cardNew: { marginHorizontal: 14, marginBottom: 2 },
  jobCard: {
    backgroundColor: C.surface, marginVertical: 6, padding: 16,
    borderRadius: 18, shadowColor: "#000", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10, shadowRadius: 16, elevation: 5,
    borderWidth: 1, borderColor: C.border,
  },
  cardTop: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  orgIcon: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: C.primaryMuted,
    alignItems: "center", justifyContent: "center", marginRight: 12,
    borderWidth: 1, borderColor: "rgba(10,140,95,0.18)",
  },
  orgText: { color: C.primary, fontWeight: "700", fontSize: 14, letterSpacing: 0.5 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: C.text, letterSpacing: 0.1, lineHeight: 20 },
  cardOrg: { fontSize: 13, color: C.textMid, marginTop: 2, fontWeight: "500" },
  bookmarkIcon: {
    width: 38, height: 38, borderRadius: 10, backgroundColor: C.surfaceAlt,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: C.border,
  },

  // ── Tags ──────────────────────────────────────────────────────────────────────
  tagsRow: { flexDirection: "row", gap: 6, marginBottom: 12, flexWrap: "wrap" },
  tag: {
    backgroundColor: C.primaryMuted, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1, borderColor: "rgba(10,140,95,0.22)",
    fontSize: 12, fontWeight: "600", color: C.primary, maxWidth: 140,
  },
  tagState: {
    backgroundColor: C.stateTag, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1, borderColor: C.stateBorder,
    fontSize: 12, fontWeight: "600", color: "#2C5F96", maxWidth: 140,
  },
  urgentBadge: {
    backgroundColor: "#FFF0EE", paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1, borderColor: "#F5C6C0",
  },
  urgentText: { fontSize: 10, fontWeight: "700", color: C.danger },

  // ── Card Footer ───────────────────────────────────────────────────────────────
  divider: { height: 1, backgroundColor: C.border, marginVertical: 12 },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  dateText: { fontSize: 12, fontWeight: "600", color: C.danger, letterSpacing: 0.1 },
  applyBtn: {
    backgroundColor: C.primary, paddingHorizontal: 18, paddingVertical: 9,
    borderRadius: 10, shadowColor: C.primary, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.40, shadowRadius: 6, elevation: 4, borderWidth: 1, borderColor: 'gray'
  },
  applyText: { color: C.white, fontSize: 13, fontWeight: "700", letterSpacing: 0.3 },
  // ── Filter Chips ──────────────────────────────────────────────────────────────
  filterSection: {
    marginBottom: 14,
  },
  chipList: {
    paddingHorizontal: 14,
    gap: 8,
    marginBottom: 8,
  },
  filterChip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1, borderColor: "rgba(167, 158, 158, 0.38)",
  },
  filterChipActive: {
    backgroundColor: C.primaryMuted,
    borderColor: "rgba(10,140,95,0.35)",
  },
  filterChipText: {
    fontSize: 12, fontWeight: "600",
    color: "rgba(255, 255, 255, 0.53)",
  },
  filterChipTextActive: {
    color: C.primary,
  },
  activeFilterRow: {
    flexDirection: "row", alignItems: "center", gap: 6,
    marginHorizontal: 14, marginBottom: 8,
    backgroundColor: "rgba(10,140,95,0.10)",
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 10, borderWidth: 1,
    borderColor: "rgba(10,140,95,0.20)",
  },
  activeFilterText: {
    flex: 1, fontSize: 12, fontWeight: "600", color: C.primary,
  },
  clearBtn: {
    flexDirection: "row", alignItems: "center", gap: 3,
  },
  clearBtnText: {
    fontSize: 11, fontWeight: "600", color: C.danger,
  },
  loadMoreBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, marginHorizontal: 14, marginVertical: 16,
    paddingVertical: 13, borderRadius: 14,
    backgroundColor: C.primaryMuted,
    borderWidth: 1, borderColor: "rgba(10,140,95,0.25)",
  },
  loadMoreText: {
    fontSize: 14, fontWeight: "700", color: C.primary,
  },
  noMoreWrap: {
    alignItems: "center", paddingVertical: 20,
  },
  noMoreText: {
    fontSize: 12, color: "rgba(255,255,255,0.25)",
    fontWeight: "500", letterSpacing: 0.3,
  },
  quickRow: {
    marginHorizontal: 14,
    marginBottom: 16,
    gap: 10,
  },
  quickCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    borderLeftWidth: 3,
  },
  quickIcon: {
    width: 40, height: 40, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  quickTitle: {
    fontSize: 14, fontWeight: "700", color: C.white,
  },
  quickSub: {
    fontSize: 11, color: "rgba(255,255,255,0.4)",
    marginTop: 2, fontWeight: "500",
  },
  iconBtnActive: {
    backgroundColor: "rgba(10,140,95,0.18)",
    borderColor: "rgba(10,140,95,0.35)",
  },
  dropdown: {
    position: "absolute",
    right: 16,
    zIndex: 100,
    backgroundColor: "#132E24",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    paddingVertical: 6,
    width: 220,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 10,
  },
  dropdownItem: {
    flexDirection: "row", alignItems: "center",
    gap: 12, paddingHorizontal: 14, paddingVertical: 12,
  },
  dropdownIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  dropdownTitle: {
    fontSize: 14, fontWeight: "700", color: C.white,
  },
  dropdownSub: {
    fontSize: 11, color: "rgba(255,255,255,0.4)",
    marginTop: 1, fontWeight: "500",
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginHorizontal: 14,
  },
  backdrop: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 99,
  },
  notifDot: {
    position: "absolute",
    top: 6, right: 6,
    width: 8, height: 8,
    borderRadius: 4,
    backgroundColor: "#F5A623",
    borderWidth: 1.5,
    borderColor: C.bg,
  },
  dailyQuizCard: {
    marginHorizontal: 14,
    marginBottom: 16,
    backgroundColor: "#1A2E27",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  dailyLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  dailyIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(255,122,0,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  dailyTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

  dailySub: {
    marginTop: 4,
    color: "rgba(255,255,255,0.45)",
    fontSize: 12,
  },
  streakCard: {
  marginHorizontal: 14,
  marginBottom: 12,
  backgroundColor: "#1A2E27",
  borderRadius: 18,
  padding: 16,
  borderWidth: 1,
  borderColor: "rgba(255,122,0,0.18)",
},

streakLeft: {
  flexDirection: "row",
  alignItems: "center",
  gap: 14,
},

streakIconWrap: {
  width: 52,
  height: 52,
  borderRadius: 16,
  backgroundColor:
    "rgba(255,122,0,0.12)",

  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
borderColor: "rgba(255,122,0,0.18)",

shadowColor: "#FF7A00",
shadowOffset: {
  width: 0,
  height: 4,
},
shadowOpacity: 0.35,
shadowRadius: 10,
elevation: 5,
},

streakEmoji: {
  fontSize: 24,
},

streakTitle: {
  color: "#fff",
  fontSize: 16,
  fontWeight: "700",
},

streakSub: {
  marginTop: 4,
  color:
    "rgba(255,255,255,0.45)",

  fontSize: 12,
},
chatFloatingButton: {
  position: "absolute",
  bottom: 20,
  right: 20,
  width: 56,
  height: 56,
  borderRadius: 28,
  backgroundColor: C.primary,
  alignItems: "center",
  justifyContent: "center",
  zIndex: 105,
  shadowColor: C.primary,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 8,
},
});