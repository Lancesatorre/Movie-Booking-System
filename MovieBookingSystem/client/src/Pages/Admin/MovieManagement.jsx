// MovieManagement.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Film,
  Edit2,
  Trash2,
  Search,
  Filter,
  X,
  Eye,
  EyeOff,
  ChevronDown,
  Plus,
  Image as ImageIcon,
  CalendarDays
} from 'lucide-react';
import ConfirmationModal from '../../Modal/ConfimationModal';

const API_BASE = "http://localhost/mobook_api";

export default function MovieManagement() {
  const [animateCards, setAnimateCards] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [publishFilter, setPublishFilter] = useState('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState(null);
  const [movies, setMovies] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [screens, setScreens] = useState([]);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [loadingTheaters, setLoadingTheaters] = useState(true);
  const [loadingScreens, setLoadingScreens] = useState(true);
  const [error, setError] = useState("");
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const [showEditGenreDropdown, setShowEditGenreDropdown] = useState(false);

  const ratings = ['G', 'PG', 'PG-13', 'R', 'NC-17'];
  const screenOptions = [1, 2, 3];

  const genreOptions = [
    "Action",
    "Adventure",
    "Animation",
    "Comedy",
    "Crime",
    "Documentary",
    "Drama",
    "Fantasy",
    "Historical",
    "Horror",
    "Musical",
    "Mystery",
    "Romance",
    "Science Fiction (Sci-Fi)",
    "Thriller",
    "Western"
  ];

  const statuses = [
    { value: 'now-showing', label: 'Now Showing', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', glow: 'shadow-emerald-500/30' },
    { value: 'coming-soon', label: 'Coming Soon', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40', glow: 'shadow-blue-500/30' },
    { value: 'expired', label: 'Expired', color: 'bg-gray-600/20 text-gray-400 border-gray-600/40', glow: 'shadow-gray-600/30' },
    { value: 'not-published', label: 'Not Published', color: 'bg-orange-500/20 text-orange-300 border-orange-500/40', glow: 'shadow-orange-500/30' }
  ];

  // ===== Date helpers =====
  const parseDate = (dateString) => new Date(dateString);
  const startOfDay = (d) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  };

  const getEndDate = (movie) => {
    const start = startOfDay(parseDate(movie.dateRelease));
    const days = Number(movie.showingDays || 0);
    if (!days || days < 1) return start;
    const end = new Date(start);
    end.setDate(end.getDate() + days - 1);
    return end;
  };

  const isFutureDate = (dateString) => startOfDay(parseDate(dateString)) > startOfDay(new Date());

  const isExpiredByShowingDays = (movie) => {
    const today = startOfDay(new Date());
    const end = startOfDay(getEndDate(movie));
    return today > end;
  };

  const getMovieStatus = (movie) => {
    if (!movie.published) return 'not-published';
    if (isFutureDate(movie.dateRelease)) return 'coming-soon';
    if (isExpiredByShowingDays(movie)) return 'expired';
    return 'now-showing';
  };

  const getStatusBadge = (status) => statuses.find(s => s.value === status) || statuses[0];

  // ===== Edit form =====
  const [formData, setFormData] = useState({
    title: '',
    genre: [],
    price: '',
    published: false,
    duration: '',
    rating: 'PG',
    location: [],
    dateRelease: '',
    showingDays: '',
    description: '',
    trailer: '',     // ✅ NEW
    image: ''
  });
  const [editImagePreview, setEditImagePreview] = useState('');

  // ===== Add form =====
  const [newMovie, setNewMovie] = useState({
    title: '',
    genre: [],
    price: '',
    published: false,
    duration: '',
    rating: 'PG',
    location: [],
    screens: [],
    dateRelease: '',
    showingDays: '',
    description: '',
    trailer: '',     // ✅ NEW (required)
    image: '',
    times: []
  });
  const [addImagePreview, setAddImagePreview] = useState('');

  // NEW: UI states for tag-style dropdowns
  const [locOpen, setLocOpen] = useState(false);
  const [screenOpen, setScreenOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);

  const locBoxRef = useRef(null);
  const screenBoxRef = useRef(null);
  const ratingBoxRef = useRef(null);

  // NEW: showtime input local state
  const [timeInput, setTimeInput] = useState('');

  // Refs for calendar inputs (native)
  const addDateRef = useRef(null);
  const editDateRef = useRef(null);

  // ---------------------------
  // Fetch Movies
  // ---------------------------
  const fetchMovies = async () => {
    setLoadingMovies(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/get_movies.php?admin=1`);
      const data = await res.json();
      if (data.success) {
        const normalized = (data.movies || []).map(m => ({
          id: m.id,
          title: m.title,
          genre: m.genre,
          price: Number(m.price || 0),
          published: (m.published !== undefined ? !!m.published : true),
          duration: m.duration || "",
          rating: m.rating || "",
          location: m.location || "",
          dateRelease: m.releaseDateRaw || m.dateRelease || "",
          showingDays: Number(m.showingDays || 7),
          description: m.description || "",   // ✅ NEW
          trailer: m.trailer || "",           // ✅ NEW
          image: m.image || ""
        }));
        setMovies(normalized);
      } else {
        setError(data.message || "Failed to load movies.");
        setMovies([]);
      }
    } catch (e) {
      setError("Unable to connect to server.");
      setMovies([]);
    } finally {
      setLoadingMovies(false);
    }
  };

  // ---------------------------
  // Fetch Theaters
  // ---------------------------
  const fetchTheaters = async () => {
    setLoadingTheaters(true);
    try {
      const res = await fetch(`${API_BASE}/get_theaters.php`);
      const data = await res.json();
      if (data.success) setTheaters(data.theaters || []);
      else setTheaters([]);
    } catch {
      setTheaters([]);
    } finally {
      setLoadingTheaters(false);
    }
  };

  // ---------------------------
  // Fetch Screens
  // ---------------------------
  const fetchScreens = async () => {
    setLoadingScreens(true);
    try {
      const res = await fetch(`${API_BASE}/get_screens.php`);
      const data = await res.json();
      if (data.success) setScreens(data.screens || []);
      else setScreens([]);
    } catch {
      setScreens([]);
    } finally {
      setLoadingScreens(false);
    }
  };

  useEffect(() => {
    setAnimateCards(true);
    fetchMovies();
    fetchTheaters();
    fetchScreens();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (locBoxRef.current && !locBoxRef.current.contains(e.target)) setLocOpen(false);
      if (screenBoxRef.current && !screenBoxRef.current.contains(e.target)) setScreenOpen(false);
      if (ratingBoxRef.current && !ratingBoxRef.current.contains(e.target)) setRatingOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  // ---------------------------
  // Helpers for backend IDs
  // ---------------------------
  const getGenreId = (genreName) => {
    const idx = genreOptions.findIndex(g => g === genreName);
    return idx >= 0 ? idx + 1 : null;
  };

  const getTheaterIdsFromLocationInput = (locationInput) => {
    if (!locationInput) return [];

    const parts = Array.isArray(locationInput)
      ? locationInput.map(s => String(s).trim().toLowerCase()).filter(Boolean)
      : String(locationInput)
          .split(",")
          .map(s => s.trim().toLowerCase())
          .filter(Boolean);

    const ids = [];
    for (const p of parts) {
      const match = theaters.find(t =>
        t.name.toLowerCase() === p || t.location.toLowerCase() === p
      );
      if (match) ids.push(match.id);
    }
    return ids;
  };

  const openEditModal = (movie) => {
    if (movie.published) return;

    setSelectedMovie(movie);

    const data = {
      title: movie.title,
      genre: Array.isArray(movie.genre)
        ? movie.genre
        : String(movie.genre || "")
            .split(",")
            .map(g => g.trim())
            .filter(Boolean),
      price: movie.price,
      published: movie.published,
      duration: movie.duration,
      rating: movie.rating,
      location: movie.location,
      dateRelease: movie.dateRelease,
      showingDays: (movie.showingDays !== undefined && movie.showingDays !== null) ? movie.showingDays : 7,
      description: movie.description || "",
      trailer: movie.trailer || "",     // ✅ NEW
      image: movie.image
    };

    setFormData(data);
    setOriginalData(data);
    setEditImagePreview(movie.image || '');
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedMovie(null);
    setOriginalData(null);
    setIsSaving(false);
    setEditImagePreview('');
  };

  const hasChanges = () => {
    if (!originalData) return false;
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  // ✅ REAL EDIT SUBMIT (calls update_movie.php)
  const handleEditSubmit = async () => {
    // trailer is NOT required on edit
    const required = ['title', 'genre', 'price', 'duration', 'location', 'dateRelease', 'showingDays', 'description'];
    for (const k of required) {
      if (!String(formData[k] ?? '').trim()) {
        alert('Please fill in all required fields');
        return;
      }
    }
    if (!formData.image) {
      alert('Please add a movie poster/image');
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const fd = new FormData();
      fd.append("movieId", selectedMovie.id);

      fd.append("title", formData.title.trim());
      const durationNum = parseInt(String(formData.duration).replace(/[^\d]/g, ""), 10);
      fd.append("duration", durationNum || 0);

      fd.append("rating", formData.rating);
      fd.append("trailer", (formData.trailer || "").trim()); // ✅ blank allowed
      fd.append("description", formData.description.trim());
      fd.append("releaseDate", formData.dateRelease);
      fd.append("showingDays", formData.showingDays);
      fd.append("price", formData.price);
      fd.append("published", formData.published ? 1 : 0);

      // existing poster if not changed
      fd.append("existingPosterPath", selectedMovie.image || formData.image || "");

      // genres[]
      (formData.genre || []).forEach(gName => {
        const gid = getGenreId(gName);
        if (gid) fd.append("genres[]", gid);
      });

      // theaters[]
      const theaterIds = getTheaterIdsFromLocationInput(formData.location);
      theaterIds.forEach(id => fd.append("theaters[]", id));

      // screens[] + times[] (if your backend supports edit showtimes)
      // If you don't show screens/times in edit UI yet,
      // backend will simply keep old showtimes when arrays are empty.
      (formData.screens || []).forEach(id => fd.append("screens[]", id));
      (formData.times || []).forEach(t => fd.append("times[]", t));

      if (formData.posterFile) {
        fd.append("poster", formData.posterFile);
      }

      const res = await fetch(`${API_BASE}/update_movie.php`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Failed to update movie.");
        return;
      }

      closeEditModal();
      fetchMovies();

    } catch (err) {
      alert("Server error while updating movie.");
    } finally {
      setIsSaving(false);
    }
  };

  const openAddModal = () => {
    setNewMovie({
      title: '',
      genre: [],
      price: '',
      published: false,
      duration: '',
      rating: 'PG',
      location: [],
      screens: [],
      dateRelease: '',
      showingDays: 7,
      description: '',
      trailer: '',
      image: '',
      times: []
    });
    setAddImagePreview('');
    setTimeInput('');
    setLocOpen(false);
    setScreenOpen(false);
    setRatingOpen(false);
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setAddImagePreview('');
    setLocOpen(false);
    setScreenOpen(false);
    setRatingOpen(false);
  };

  // ✅ Add submit requires trailer
  const handleAddSubmit = async () => {
    const required = ['title', 'price', 'duration', 'dateRelease', 'showingDays', 'description', 'trailer'];
    for (const k of required) {
      if (!String(newMovie[k] ?? '').trim()) {
        alert('Please fill in all required fields');
        return;
      }
    }

     if (newMovie.dateRelease) {
    const selectedDate = startOfDay(parseDate(newMovie.dateRelease));
    const today = startOfDay(new Date());
    if (selectedDate < today) {
      alert('Release date cannot be in the past. Please select today or a future date.');
      return;
    }

    if (selectedDate.getTime() === today.getTime() && newMovie.times && newMovie.times.length > 0) {
      const now = new Date();
      const threeHoursFromNow = new Date(now.getTime() + (3 * 60 * 60 * 1000));
      const currentTimeInMinutes = threeHoursFromNow.getHours() * 60 + threeHoursFromNow.getMinutes();
      
      for (const time of newMovie.times) {
        const [hours, minutes] = time.split(':').map(Number);
        const timeInMinutes = hours * 60 + minutes;
        
        if (timeInMinutes < currentTimeInMinutes) {
          alert(`Showtimes must be at least 3 hours from now. The earliest allowed time today is ${threeHoursFromNow.getHours().toString().padStart(2, '0')}:${threeHoursFromNow.getMinutes().toString().padStart(2, '0')}`);
          return;
        }
      }
    }
    }

    if (!newMovie.genre || newMovie.genre.length === 0) {
      alert("Please select at least one genre");
      return;
    }
    if (!newMovie.location || newMovie.location.length === 0) {
      alert('Please select at least one location');
      return;
    }
    if (!newMovie.screens || newMovie.screens.length === 0) {
      alert('Please select at least one screen');
      return;
    }
    if (!newMovie.times || newMovie.times.length === 0) {
      alert('Please add at least one showtime');
      return;
    }
    if (!newMovie.posterFile && !newMovie.image) {
      alert('Please add a movie poster/image');
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const fd = new FormData();

      fd.append("title", newMovie.title.trim());
      const durationNum = parseInt(String(newMovie.duration).replace(/[^\d]/g, ""), 10);
      fd.append("duration", durationNum || 0);

      fd.append("rating", newMovie.rating);
      fd.append("trailer", newMovie.trailer.trim());  // ✅ NOW SENT
      fd.append("description", newMovie.description.trim());
      fd.append("releaseDate", newMovie.dateRelease);
      fd.append("showingDays", newMovie.showingDays);
      fd.append("price", newMovie.price);
      fd.append("published", newMovie.published ? 1 : 0);

      newMovie.genre.forEach(gName => {
        const gid = getGenreId(gName);
        if (gid) fd.append("genres[]", gid);
      });

      const theaterIds = getTheaterIdsFromLocationInput(newMovie.location);
      theaterIds.forEach(id => fd.append("theaters[]", id));

      newMovie.screens.forEach(id => fd.append("screens[]", id));
      newMovie.times.forEach(t => fd.append("times[]", t));

      if (newMovie.posterFile) {
        fd.append("poster", newMovie.posterFile);
      }

      const res = await fetch(`${API_BASE}/add_movie.php`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Failed to add movie.");
        return;
      }

      closeAddModal();
      fetchMovies();

    } catch (err) {
      alert("Server error while adding movie.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (movie) => {
    if (movie.published) return;
    setMovieToDelete(movie);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!movieToDelete) return;

    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE}/delete_movie.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId: movieToDelete.id }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Failed to delete movie.");
        return;
      }

      // remove from UI immediately
      setMovies(prev => prev.filter(m => m.id !== movieToDelete.id));

      setShowDeleteModal(false);
      setMovieToDelete(null);

    } catch (err) {
      console.error(err);
      alert("Server error while deleting movie.");
    } finally {
      setIsSaving(false);
    }
  };


  const cancelDelete = () => {
    setShowDeleteModal(false);
    setMovieToDelete(null);
  };

  const onAddImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setAddImagePreview(previewUrl);
    setNewMovie({ ...newMovie, image: previewUrl, posterFile: file });
  };

  const onEditImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setEditImagePreview(previewUrl);
    setFormData({ ...formData, image: previewUrl, posterFile: file });
  };

  // Tag-style Location multi-select
  const toggleLocation = (name) => {
    setNewMovie(prev => {
      const exists = prev.location.includes(name);
      const next = exists
        ? prev.location.filter(x => x !== name)
        : [...prev.location, name];
      return { ...prev, location: next };
    });
  };

  const removeLocation = (name) => {
    setNewMovie(prev => ({
      ...prev,
      location: prev.location.filter(x => x !== name)
    }));
  };

  const toggleGenre = (g) => {
    setNewMovie(prev => {
      const exists = prev.genre.includes(g);
      const next = exists
        ? prev.genre.filter(x => x !== g)
        : [...prev.genre, g];
      return { ...prev, genre: next };
    });
  };

  const removeGenre = (g) => {
    setNewMovie(prev => ({
      ...prev,
      genre: prev.genre.filter(x => x !== g)
    }));
  };

  // Tag-style Screen multi-select
  const toggleScreen = (screenId) => {
    setNewMovie(prev => {
      const exists = prev.screens.includes(screenId);
      const next = exists
        ? prev.screens.filter(x => x !== screenId)
        : [...prev.screens, screenId];
      return { ...prev, screens: next };
    });
  };

  const removeScreen = (screenId) => {
    setNewMovie(prev => ({
      ...prev,
      screens: prev.screens.filter(x => x !== screenId)
    }));
  };

  // Tag-style Rating single select
  const setRatingSingle = (r) => {
    setNewMovie(prev => ({ ...prev, rating: r }));
    setRatingOpen(false);
  };

  // Showtimes
  const addTime = () => {
    const t = (timeInput || '').trim();
    if (!t) return;
    setNewMovie(prev => {
      if (prev.times.includes(t)) return prev;
      const next = [...prev.times, t].sort();
      return { ...prev, times: next };
    });
    setTimeInput('');
  };

  const removeTime = (t) => {
    setNewMovie(prev => ({
      ...prev,
      times: prev.times.filter(x => x !== t)
    }));
  };

  const filteredMovies = movies.filter(movie => {
    const matchesSearch =
      movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.genre.toLowerCase().includes(searchQuery.toLowerCase());

    const movieStatus = getMovieStatus(movie);
    const matchesFilter = filterStatus === 'all' || movieStatus === filterStatus;

    const matchesPublish =
      publishFilter === 'all' ||
      (publishFilter === 'published' && movie.published) ||
      (publishFilter === 'not-published' && !movie.published);

    return matchesSearch && matchesFilter && matchesPublish;
  });

  const stats = [
    { label: 'Total Movies', value: movies.length, color: 'from-red-600 via-red-500 to-pink-600', icon: Film, glow: 'shadow-red-500/50' },
    { label: 'Published', value: movies.filter(m => m.published).length, color: 'from-emerald-600 via-green-500 to-teal-600', icon: Eye, glow: 'shadow-emerald-500/50' },
    { label: 'Not Published', value: movies.filter(m => !m.published).length, color: 'from-orange-600 via-amber-500 to-yellow-600', icon: EyeOff, glow: 'shadow-orange-500/50' },
    { label: 'Now Showing', value: movies.filter(m => getMovieStatus(m) === 'now-showing').length, color: 'from-blue-600 via-cyan-500 to-sky-600', icon: Film, glow: 'shadow-blue-500/50' },
  ];

  const formatPrettyDate = (iso) => {
    if (!iso) return '';
    const d = parseDate(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Header */}
      <div className="mb-8 md:mb-12 pt-15 animate-slide-down">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-700 to-orange-600/20">
              Movies
            </h1>
          </div>

          <button
            onClick={openAddModal}
            className="cursor-pointer flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all duration-300 border-2 bg-gradient-to-r from-red-600 to-pink-600 text-white border-red-500/50 hover:scale-105 hover:shadow-xl shadow-lg shadow-red-500/50"
          >
            <Plus size={18} />
            Add Movie
          </button>
        </div>

        <p className="text-left md:text-lg text-gray-400">
          Manage your cinema's movie catalog, showtime preparation, and availability
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-10">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`relative bg-gradient-to-br from-gray-500/20 to-black/20 backdrop-blur-md border border-red-900/30 rounded-lg min-[480px]:rounded-xl md:rounded-2xl p-3 min-[480px]:p-4 md:p-5 lg:p-6 overflow-hidden group hover:scale-105 hover:border-red-500/50 transition-all duration-300 hover:shadow-lg md:hover:shadow-2xl ${stat.glow} ${
                animateCards ? 'animate-slide-up' : 'opacity-0'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              <div className="absolute -top-5 -right-5 min-[480px]:-top-6 min-[480px]:-right-6 md:-top-8 md:-right-8 lg:-top-12 lg:-right-12 w-16 h-16 min-[480px]:w-20 min-[480px]:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32  rounded-full blur-xl min-[480px]:blur-2xl md:blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2 min-[480px]:mb-3 md:mb-4">
                  <div className='flex flex-row items-center gap-1.5 min-[480px]:gap-2 md:gap-2.5 lg:gap-3 flex-1 min-w-0'>
                    <Icon className="text-gray-500 group-hover:text-red-400 transition-colors duration-300 flex-shrink-0 w-4 h-4 min-[480px]:w-4 min-[480px]:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
                    <p className="text-gray-400 text-xs min-[480px]:text-sm md:text-base lg:text-lg font-medium truncate">
                      {stat.label}
                    </p>
                  </div>
                  <div className={`w-1.5 h-1.5 min-[480px]:w-2 min-[480px]:h-10 rounded-full bg-gradient-to-r ${stat.color} animate-pulse flex-shrink-0 ml-2`}></div>
                </div>
                <p className="text-xl text-left min-[480px]:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 group-hover:from-red-400 group-hover:to-pink-400 transition-all duration-300 leading-tight">
                  {stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search + Filters */}
      <div className="bg-gradient-to-br from-gray-500/20 to-black/20 backdrop-blur-md border border-red-900/30 rounded-2xl p-5 mb-8 shadow-2xl hover:border-red-500/30 transition-all duration-300">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-red-400 transition-colors duration-300" size={20} />
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/60 border-2 border-gray-800/50 focus:border-red-500/50 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-all duration-300 hover:bg-black/80"
            />
          </div>

          <div className="flex gap-3 flex-wrap md:flex-nowrap">
            <div className="relative flex-1 md:flex-initial md:w-auto group">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 pointer-events-none" size={20} />
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 pointer-events-none" size={16} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full md:w-auto bg-black/60 border-2 border-gray-800/50 focus:border-red-500/50 rounded-xl pl-12 pr-12 py-3 text-white focus:outline-none transition-all duration-300 appearance-none cursor-pointer hover:bg-black/80"
              >
                <option value="all">All Status</option>
                <option value="now-showing">Now Showing</option>
                <option value="coming-soon">Coming Soon</option>
                <option value="expired">Expired</option>
                <option value="not-published">Not Published</option>
              </select>
            </div>

            <button
              onClick={() => setPublishFilter('published')}
              className={`cursor-pointer px-5 py-3 rounded-xl font-bold transition-all duration-300 border-2 hover:scale-105 hover:shadow-xl ${
                publishFilter === 'published'
                  ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white border-emerald-500/50 shadow-lg shadow-emerald-500/50'
                  : 'bg-black/60 text-gray-300 border-gray-800/50 hover:border-emerald-500/50'
              }`}
            >
              Published
            </button>

            <button
              onClick={() => setPublishFilter('not-published')}
              className={`cursor-pointer px-5 py-3 rounded-xl font-bold transition-all duration-300 border-2 hover:scale-105 hover:shadow-xl ${
                publishFilter === 'not-published'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white border-orange-500/50 shadow-lg shadow-orange-500/50'
                  : 'bg-black/60 text-gray-300 border-gray-800/50 hover:border-orange-500/50'
              }`}
            >
              Not Published
            </button>

            {publishFilter !== 'all' && (
              <button
                onClick={() => setPublishFilter('all')}
                className="cursor-pointer px-5 py-3 rounded-xl font-bold transition-all duration-300 border-2 bg-gradient-to-r from-red-600 to-pink-600 text-white border-red-500/50 hover:scale-105 hover:shadow-xl shadow-lg shadow-red-500/50 animate-scale-in"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Movies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        {filteredMovies.map((movie, index) => {
          const movieStatus = getMovieStatus(movie);
          const isPublished = movie.published;
          const statusBadge = getStatusBadge(movieStatus);
          const endDate = getEndDate(movie);

          return (
            <div
              key={movie.id}
              className={`group bg-gradient-to-br from-gray-500/20 to-black/20 backdrop-blur-md border-2 border-red-900/30 rounded-3xl overflow-hidden hover:border-red-500/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-red-500/20 ${
                animateCards ? 'animate-fade-in' : 'opacity-0'
              }`}
              style={{ animationDelay: `${400 + index * 80}ms` }}
            >
              <div className="relative h-96 overflow-hidden">
                <img
                  src={movie.image}
                  alt={movie.title}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>

                {!isPublished && (
                  <div className="absolute top-4 right-4 flex gap-2 animate-slide-left">
                    <button
                      onClick={() => openEditModal(movie)}
                      className="cursor-pointer p-3 rounded-xl transition-all duration-300 hover:scale-110 backdrop-blur-md border-2 bg-gradient-to-br from-blue-600/90 to-cyan-600/90 hover:from-blue-500 hover:to-cyan-500 border-blue-500/50 shadow-lg shadow-blue-500/50"
                      title="Edit Movie"
                    >
                      <Edit2 size={18} className="text-white" />
                    </button>

                    <button
                      onClick={() => handleDeleteClick(movie)}
                      className="cursor-pointer p-3 rounded-xl transition-all duration-300 hover:scale-110 backdrop-blur-md border-2 bg-gradient-to-br from-red-600/90 to-pink-600/90 hover:from-red-500 hover:to-pink-500 border-red-500/50 shadow-lg shadow-red-500/50"
                      title="Delete Movie"
                    >
                      <Trash2 size={18} className="text-white" />
                    </button>
                  </div>
                )}

                <div className="absolute top-4 left-4">
                  <span className={`px-4 py-2 rounded-xl text-xs font-bold border-2 backdrop-blur-md ${statusBadge.color} ${statusBadge.glow} shadow-lg animate-pulse-slow`}>
                    {statusBadge.label}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-3xl font-black text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-red-400 group-hover:to-pink-400 transition-all duration-300 drop-shadow-lg">
                    {movie.title}
                  </h3>
                  <p className="text-gray-300 text-sm font-medium">{movie.genre}</p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-gray-800/50 hover:border-green-500/30 transition-colors duration-300">
                  <span className="text-gray-400 text-sm font-semibold">Price</span>
                  <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">₱{movie.price}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-black/40 rounded-xl border border-gray-800/50 hover:border-purple-500/30 transition-colors duration-300">
                    <span className="text-gray-400 text-xs font-semibold block mb-1">Duration</span>
                    <span className="text-white text-sm font-bold">{movie.duration}</span>
                  </div>

                  <div className="p-3 bg-black/40 rounded-xl border border-gray-800/50 hover:border-purple-500/30 transition-colors duration-300">
                    <span className="text-gray-400 text-xs font-semibold block mb-1">Rating</span>
                    <span className="inline-block border border-red-900/50 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-md shadow-red-500/30">
                      {movie.rating}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-black/40 rounded-xl border border-gray-800/50 hover:border-blue-500/30 transition-colors duration-300">
                  <span className="text-gray-400 text-xs font-semibold block mb-1">Location</span>
                  <span className="text-white text-sm font-medium">{movie.location}</span>
                </div>

                <div className="p-3 bg-black/40 rounded-xl border border-gray-800/50 hover:border-red-500/30 transition-colors duration-300">
                  <span className="text-gray-400 text-xs font-semibold block mb-1">Release Date</span>
                  <span className="text-white text-sm font-bold">{formatPrettyDate(movie.dateRelease)}</span>
                </div>

                <div className="p-3 bg-black/40 rounded-xl border border-gray-800/50 hover:border-orange-500/30 transition-colors duration-300">
                  <span className="text-gray-400 text-xs font-semibold block mb-1 flex items-center gap-2">
                    <CalendarDays size={14} /> Showing Window
                  </span>
                  <span className="text-white text-sm font-bold">
                    {movie.showingDays} day(s) — ends on {endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                {isPublished && (
                  <div className="mt-4 pt-4 border-t-2 border-gray-800/50">
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500 italic">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500 animate-pulse"></div>
                      <span>Published - No editing allowed</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredMovies.length === 0 && (
        <div className="text-center py-20 animate-fade-in">
          <div className="inline-block p-6 bg-gradient-to-br from-gray-900/90 to-black/90 rounded-3xl border-2 border-gray-800/50 mb-6">
            <Film size={80} className="text-gray-700 mx-auto" />
          </div>
          <p className="text-gray-400 text-2xl font-bold">
            {loadingMovies ? "Loading movies..." : "No movies found"}
          </p>
          <p className="text-gray-600 text-sm mt-2">
            {loadingMovies ? "Please wait a moment" : "Try adjusting your search or filters"}
          </p>
        </div>
      )}

      {/* ================= ADD MODAL ================= */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in text-left">
          <div className="bg-gradient-to-br from-gray-500/20 to-black/20 backdrop-blur-md border border-red-900/30 rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-red-500/20 animate-scale-in">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-red-600 to-pink-600 rounded-2xl shadow-lg shadow-red-500/50">
                  <Plus className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-400">
                    Add Movie
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">Fill in movie details</p>
                </div>
              </div>
              <button
                onClick={closeAddModal}
                className="cursor-pointer p-3 hover:bg-red-500/20 rounded-xl transition-all duration-300 hover:scale-110 border-2 border-transparent hover:border-red-500/50"
              >
                <X className="text-gray-400 hover:text-white transition-colors" size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Poster Upload */}
              <div>
                <label className="block text-gray-300 text-sm font-bold mb-3">
                  Poster / Image <span className="text-red-400">*</span>
                </label>
                <label className="cursor-pointer flex items-center gap-3 w-full bg-black/60 border-2 border-gray-800/50 rounded-xl px-4 py-3 text-white transition-all duration-300 hover:bg-black/80 hover:border-red-500/40">
                  <ImageIcon size={18} className="text-gray-400" />
                  <span className="text-gray-400 text-sm">
                    {addImagePreview ? 'Change image' : 'Upload image'}
                  </span>
                  <input type="file" accept="image/*" onChange={onAddImageChange} className="hidden" />
                </label>

                {addImagePreview && (
                  <div className="mt-4 rounded-2xl overflow-hidden border border-gray-800/60">
                    <img src={addImagePreview} alt="Preview" className="w-full h-64 object-cover" />
                  </div>
                )}
              </div>

              {/* Title + Genre */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-3">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={newMovie.title}
                    onChange={(e) => setNewMovie({ ...newMovie, title: e.target.value })}
                    className="w-full bg-black/60 border-2 border-gray-800/50 focus:border-red-500/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-all duration-300 hover:bg-black/80"
                    placeholder="Movie title"
                  />
                </div>

                {/* Genre multi-select tag-style */}
                <div className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-3">
                    Genre <span className="text-red-400">*</span>
                  </label>

                  <div
                    onClick={() => setShowGenreDropdown(v => !v)}
                    className="w-full bg-black/60 border-2 border-gray-800/50 focus-within:border-red-500/50 rounded-xl px-3 py-2.5 text-white transition-all duration-300 hover:bg-black/80 cursor-pointer min-h-[48px] flex items-center flex-wrap gap-2"
                  >
                    {newMovie.genre.length === 0 && (
                      <span className="text-gray-500 text-sm px-1">Select genre(s)...</span>
                    )}

                    {newMovie.genre.map(g => (
                      <span
                        key={g}
                        className="flex items-center gap-2 bg-black/70 border border-red-900/50 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-md shadow-red-500/20"
                      >
                        {g}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeGenre(g);
                          }}
                          className="cursor-pointer text-gray-300 hover:text-white"
                          title="Remove"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}

                    <div className="ml-auto flex items-center gap-2">
                      <ChevronDown
                        size={16}
                        className={`text-gray-500 transition-transform ${showGenreDropdown ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </div>

                  {showGenreDropdown && (
                    <div className="absolute z-50 mt-2 w-full bg-black/90 backdrop-blur-md border-2 border-gray-800/70 rounded-xl max-h-56 overflow-y-auto shadow-2xl">
                      {genreOptions.map(g => {
                        const checked = newMovie.genre.includes(g);
                        return (
                          <button
                            key={g}
                            type="button"
                            onClick={() => toggleGenre(g)}
                            className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between ${
                              checked
                                ? 'bg-red-600/20 text-white'
                                : 'text-gray-300 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            <span>{g}</span>
                            {checked && <span className="text-red-400 font-bold">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Price + Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-3">
                    Price (₱) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={newMovie.price}
                    onChange={(e) => setNewMovie({ ...newMovie, price: e.target.value })}
                    className="w-full bg-black/60 border-2 border-gray-800/50 focus:border-red-500/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-all duration-300 hover:bg-black/80"
                    placeholder="350"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-3">
                    Duration <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={newMovie.duration}
                    onChange={(e) => setNewMovie({ ...newMovie, duration: e.target.value })}
                    className="w-full bg-black/60 border-2 border-gray-800/50 focus:border-red-500/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-all duration-300 hover:bg-black/80"
                    placeholder="120 min"
                  />
                </div>
              </div>

              {/* ✅ NEW Trailer (Add - required) */}
              <div>
                <label className="block text-gray-300 text-sm font-bold mb-3">
                  Trailer (YouTube link) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={newMovie.trailer}
                  onChange={(e) => setNewMovie({ ...newMovie, trailer: e.target.value })}
                  className="w-full bg-black/60 border-2 border-gray-800/50 focus:border-red-500/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-all duration-300 hover:bg-black/80"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              {/* Rating + Location (tag-style) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Rating single-select tag-style */}
                <div ref={ratingBoxRef} className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-3">
                    Rating <span className="text-red-400">*</span>
                  </label>

                  <div
                    onClick={() => setRatingOpen(v => !v)}
                    className="w-full bg-black/60 border-2 border-gray-800/50 focus-within:border-red-500/50 rounded-xl px-3 py-2.5 text-white transition-all duration-300 hover:bg-black/80 cursor-pointer min-h-[48px] flex items-center flex-wrap gap-2"
                  >
                    {!newMovie.rating && (
                      <span className="text-gray-500 text-sm px-1">Select rating...</span>
                    )}

                    {newMovie.rating && (
                      <span className="flex items-center gap-2 bg-black/70 border border-red-900/50 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-md shadow-red-500/20">
                        {newMovie.rating}
                      </span>
                    )}

                    <div className="ml-auto flex items-center gap-2">
                      <ChevronDown size={16} className={`text-gray-500 transition-transform ${ratingOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {ratingOpen && (
                    <div className="absolute z-50 mt-2 w-full bg-black/90 backdrop-blur-md border-2 border-gray-800/70 rounded-xl max-h-56 overflow-y-auto shadow-2xl">
                      {ratings.map(r => {
                        const checked = newMovie.rating === r;
                        return (
                          <button
                            key={r}
                            type="button"
                            onClick={() => {
                              setNewMovie(prev => ({ ...prev, rating: r }));
                              setRatingOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between ${
                              checked
                                ? 'bg-red-600/20 text-white'
                                : 'text-gray-300 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            <span>{r}</span>
                            {checked && <span className="text-red-400 font-bold">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Location multi-select tag-style */}
                <div ref={locBoxRef} className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-3">
                    Location <span className="text-red-400">*</span>
                  </label>

                  <div
                    onClick={() => !loadingTheaters && setLocOpen(v => !v)}
                    className="w-full bg-black/60 border-2 border-gray-800/50 focus-within:border-red-500/50 rounded-xl px-3 py-2.5 text-white transition-all duration-300 hover:bg-black/80 cursor-pointer min-h-[48px] flex items-center flex-wrap gap-2"
                  >
                    {newMovie.location.length === 0 && (
                      <span className="text-gray-500 text-sm px-1">Select location(s)...</span>
                    )}

                    {newMovie.location.map(loc => (
                      <span
                        key={loc}
                        className="flex items-center gap-2 bg-black/70 border border-red-900/50 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-md shadow-red-500/20"
                      >
                        {loc}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeLocation(loc);
                          }}
                          className="cursor-pointer text-gray-300 hover:text-white"
                          title="Remove"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}

                    <div className="ml-auto flex items-center gap-2">
                      <ChevronDown size={16} className={`text-gray-500 transition-transform ${locOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {locOpen && (
                    <div className="absolute z-50 mt-2 w-full bg-black/90 backdrop-blur-md border-2 border-gray-800/70 rounded-xl max-h-56 overflow-y-auto shadow-2xl">
                      {loadingTheaters && (
                        <div className="px-4 py-3 text-gray-400 text-sm">Loading locations...</div>
                      )}

                      {!loadingTheaters && theaters.length === 0 && (
                        <div className="px-4 py-3 text-gray-400 text-sm">No locations found.</div>
                      )}

                      {!loadingTheaters && theaters.map(t => {
                        const checked = newMovie.location.includes(t.name);
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => toggleLocation(t.name)}
                            className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between ${
                              checked
                                ? 'bg-red-600/20 text-white'
                                : 'text-gray-300 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            <span>{t.name} — {t.location}</span>
                            {checked && <span className="text-red-400 font-bold">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Screens multi-select tag-style */}
              <div ref={screenBoxRef} className="relative">
                <label className="block text-gray-300 text-sm font-bold mb-3">
                  Screen <span className="text-red-400">*</span>
                </label>

                <div
                  onClick={() => setScreenOpen(v => !v)}
                  className="w-full bg-black/60 border-2 border-gray-800/50 focus-within:border-red-500/50 rounded-xl px-3 py-2.5 text-white transition-all duration-300 hover:bg-black/80 cursor-pointer min-h-[48px] flex items-center flex-wrap gap-2"
                >
                  {newMovie.screens.length === 0 && (
                    <span className="text-gray-500 text-sm px-1">Select screen(s)...</span>
                  )}

                  {newMovie.screens.map(num => (
                    <span
                      key={num}
                      className="flex items-center gap-2 bg-black/70 border border-red-900/50 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-md shadow-red-500/20"
                    >
                      Screen {num}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setNewMovie(prev => ({
                            ...prev,
                            screens: prev.screens.filter(x => x !== num)
                          }));
                        }}
                        className="cursor-pointer text-gray-300 hover:text-white"
                        title="Remove"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}

                  <div className="ml-auto flex items-center gap-2">
                    <ChevronDown size={16} className={`text-gray-500 transition-transform ${screenOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {screenOpen && (
                  <div className="absolute z-50 mt-2 w-full bg-black/90 backdrop-blur-md border-2 border-gray-800/70 rounded-xl max-h-56 overflow-y-auto shadow-2xl">
                    {screenOptions.map(num => {
                      const checked = newMovie.screens.includes(num);
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => {
                            setNewMovie(prev => {
                              const exists = prev.screens.includes(num);
                              const next = exists
                                ? prev.screens.filter(x => x !== num)
                                : [...prev.screens, num];
                              return { ...prev, screens: next };
                            });
                          }}
                          className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between ${
                            checked
                              ? 'bg-red-600/20 text-white'
                              : 'text-gray-300 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <span>Screen {num}</span>
                          {checked && <span className="text-red-400 font-bold">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-gray-300 text-sm font-bold mb-3">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows="4"
                  value={newMovie.description}
                  onChange={(e) => setNewMovie({ ...newMovie, description: e.target.value })}
                  className="w-full bg-black/60 border-2 border-gray-800/50 focus:border-red-500/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-all duration-300 hover:bg-black/80 resize-none"
                  placeholder="Write a short description of the movie..."
                />
              </div>

              {/* Release date + Showing days */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-3">
                    Release Date <span className="text-red-400">*</span>
                  </label>

                  <div
                    onClick={() => addDateRef.current?.showPicker?.() || addDateRef.current?.focus()}
                    className="relative group cursor-pointer"
                  >
                    <CalendarDays
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-red-400 transition-colors duration-300 pointer-events-none"
                    />
                    <input
                      ref={addDateRef}
                      type="date"
                      value={newMovie.dateRelease}
                      onChange={(e) => setNewMovie({ ...newMovie, dateRelease: e.target.value })}
                      className="w-full bg-black/60 border-2 border-gray-800/50 focus:border-red-500/50 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none transition-all duration-300 hover:bg-black/80 cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-3">
                    Showing Days <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newMovie.showingDays}
                    onChange={(e) => setNewMovie({ ...newMovie, showingDays: e.target.value })}
                    className="w-full bg-black/60 border-2 border-gray-800/50 focus:border-red-500/50 rounded-xl px-4 py-3 text-white focus:outline-none transition-all duration-300 hover:bg-black/80"
                    placeholder="7"
                  />
                </div>
              </div>

              {/* Showtimes */}
              <div>
                <label className="block text-gray-300 text-sm font-bold mb-3">
                  Showtime(s) <span className="text-red-400">*</span>
                </label>

                <div className="flex flex-col md:flex-row gap-3 md:items-center">
                  <input
                    type="time"
                    value={timeInput}
                    onChange={(e) => setTimeInput(e.target.value)}
                    className="w-full md:flex-1 bg-black/60 border-2 border-gray-800/50 focus:border-red-500/50 rounded-xl px-4 py-3 text-white focus:outline-none transition-all duration-300 hover:bg-black/80 cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={addTime}
                    className="cursor-pointer md:w-auto w-full px-6 py-3 rounded-xl font-bold transition-all duration-300 border-2 bg-gradient-to-r from-red-600 to-pink-600 text-white border-red-500/50 hover:scale-105 hover:shadow-xl shadow-lg shadow-red-500/50"
                  >
                    Add Time
                  </button>
                </div>

                {newMovie.times.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {newMovie.times.map(t => (
                      <span
                        key={t}
                        className="flex items-center gap-2 bg-black/70 border border-red-900/50 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-md shadow-red-500/20"
                      >
                        {t}
                        <button
                          type="button"
                          onClick={() => removeTime(t)}
                          className="cursor-pointer text-gray-300 hover:text-white"
                          title="Remove time"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Publish toggle */}
              <div>
                <label className="block text-gray-300 text-sm font-bold mb-3">Publish Status</label>
                <select
                  value={newMovie.published ? 'published' : 'not-published'}
                  onChange={(e) =>
                    setNewMovie({ ...newMovie, published: e.target.value === 'published' })
                  }
                  className="w-full bg-black/60 border-2 border-gray-800/50 focus:border-red-500/50 rounded-xl px-4 py-3 text-white focus:outline-none transition-all duration-300 hover:bg-black/80 cursor-pointer"
                >
                  <option value="published">Published</option>
                  <option value="not-published">Not Published</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-6">
                <button
                  onClick={closeAddModal}
                  disabled={isSaving}
                  className="cursor-pointer flex-1 bg-gray-800/50 hover:bg-gray-700/70 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 border-2 border-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 hover:shadow-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSubmit}
                  disabled={isSaving}
                  className="cursor-pointer flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-red-500/50"
                >
                  {isSaving ? 'Saving...' : 'Add Movie'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= EDIT MODAL ================= */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in text-left">
          <div className="bg-gradient-to-br from-gray-500/20 to-black/20 backdrop-blur-md border border-red-900/30 rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-red-500/20 animate-scale-in">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl shadow-lg shadow-blue-500/50">
                  <Edit2 className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                    Edit Movie
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">{selectedMovie?.title}</p>
                </div>
              </div>
              <button
                onClick={closeEditModal}
                className="cursor-pointer p-3 hover:bg-red-500/20 rounded-xl transition-all duration-300 hover:scale-110 border-2 border-transparent hover:border-red-500/50"
              >
                <X className="text-gray-400 hover:text-white transition-colors" size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Poster Upload */}
              <div>
                <label className="block text-gray-300 text-sm font-bold mb-3">
                  Poster / Image <span className="text-red-400">*</span>
                </label>
                <label className="cursor-pointer flex items-center gap-3 w-full bg-black/60 border-2 border-gray-800/50 rounded-xl px-4 py-3 text-white transition-all duration-300 hover:bg-black/80 hover:border-red-500/40">
                  <ImageIcon size={18} className="text-gray-400" />
                  <span className="text-gray-400 text-sm">
                    {editImagePreview ? 'Change image' : 'Upload image'}
                  </span>
                  <input type="file" accept="image/*" onChange={onEditImageChange} className="hidden" />
                </label>

                {editImagePreview && (
                  <div className="mt-4 rounded-2xl overflow-hidden border border-gray-800/60">
                    <img src={editImagePreview} alt="Preview" className="w-full h-64 object-cover" />
                  </div>
                )}
              </div>

              {/* Title + Genre */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-3">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-black/60 border-2 border-gray-800/50 focus:border-red-500/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-all duration-300 hover:bg-black/80"
                    placeholder="Movie title"
                  />
                </div>

                {/* Genre multi-select tag-style for EDIT */}
                <div className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-3">
                    Genre <span className="text-red-400">*</span>
                  </label>

                  <div
                    onClick={() => setShowEditGenreDropdown(v => !v)}
                    className="w-full bg-black/60 border-2 border-gray-800/50 focus-within:border-red-500/50 rounded-xl px-3 py-2.5 text-white transition-all duration-300 hover:bg-black/80 cursor-pointer min-h-[48px] flex items-center flex-wrap gap-2"
                  >
                    {formData.genre.length === 0 && (
                      <span className="text-gray-500 text-sm px-1">Select genre(s)...</span>
                    )}

                    {formData.genre.map(g => (
                      <span
                        key={g}
                        className="flex items-center gap-2 bg-black/70 border border-red-900/50 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-md shadow-red-500/20"
                      >
                        {g}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormData(prev => ({
                              ...prev,
                              genre: prev.genre.filter(x => x !== g)
                            }));
                          }}
                          className="cursor-pointer text-gray-300 hover:text-white"
                          title="Remove"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}

                    <div className="ml-auto flex items-center gap-2">
                      <ChevronDown
                        size={16}
                        className={`text-gray-500 transition-transform ${showEditGenreDropdown ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </div>

                  {showEditGenreDropdown && (
                    <div className="absolute z-50 mt-2 w-full bg-black/90 backdrop-blur-md border-2 border-gray-800/70 rounded-xl max-h-56 overflow-y-auto shadow-2xl">
                      {genreOptions.map(g => {
                        const checked = formData.genre.includes(g);
                        return (
                          <button
                            key={g}
                            type="button"
                            onClick={() => {
                              setFormData(prev => {
                                const exists = prev.genre.includes(g);
                                const next = exists
                                  ? prev.genre.filter(x => x !== g)
                                  : [...prev.genre, g];
                                return { ...prev, genre: next };
                              });
                            }}
                            className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between ${
                              checked
                                ? 'bg-red-600/20 text-white'
                                : 'text-gray-300 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            <span>{g}</span>
                            {checked && <span className="text-red-400 font-bold">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Price + Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-3">
                    Price (₱) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-black/60 border-2 border-gray-800/50 focus:border-red-500/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-all duration-300 hover:bg-black/80"
                    placeholder="350"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-3">
                    Duration <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full bg-black/60 border-2 border-gray-800/50 focus:border-red-500/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-all duration-300 hover:bg-black/80"
                    placeholder="120 min"
                  />
                </div>
              </div>

              {/* ✅ NEW Trailer (Edit - optional) */}
              <div>
                <label className="block text-gray-300 text-sm font-bold mb-3">
                  Trailer (YouTube link)
                </label>
                <input
                  type="text"
                  value={formData.trailer}
                  onChange={(e) => setFormData({ ...formData, trailer: e.target.value })}
                  className="w-full bg-black/60 border-2 border-gray-800/50 focus:border-red-500/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-all duration-300 hover:bg-black/80"
                  placeholder="Leave blank to keep old trailer"
                />
              </div>

              {/* Rating + Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-3">
                    Rating <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    className="w-full bg-black/60 border-2 border-gray-800/50 focus:border-red-500/50 rounded-xl px-4 py-3 text-white focus:outline-none transition-all duration-300 hover:bg-black/80 cursor-pointer"
                  >
                    {ratings.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-3">
                    Location <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-black/60 border-2 border-gray-800/50 focus:border-red-500/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-all duration-300 hover:bg-black/80"
                    placeholder="e.g., SM City Cebu"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-gray-300 text-sm font-bold mb-3">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows="4"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-black/60 border-2 border-gray-800/50 focus:border-red-500/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-all duration-300 hover:bg-black/80 resize-none"
                  placeholder="Write a short description of the movie..."
                />
              </div>

              {/* Release date + Showing days */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-3">
                    Release Date <span className="text-red-400">*</span>
                  </label>

                  <div
                    onClick={() => editDateRef.current?.showPicker?.() || editDateRef.current?.focus()}
                    className="relative group cursor-pointer"
                  >
                    <CalendarDays
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-red-400 transition-colors duration-300 pointer-events-none"
                    />
                    <input
                      ref={editDateRef}
                      type="date"
                      value={formData.dateRelease}
                      onChange={(e) => setFormData({ ...formData, dateRelease: e.target.value })}
                      className="w-full bg-black/60 border-2 border-gray-800/50 focus:border-red-500/50 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none transition-all duration-300 hover:bg-black/80 cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-3">
                    Showing Days <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.showingDays}
                    onChange={(e) => setFormData({ ...formData, showingDays: e.target.value })}
                    className="w-full bg-black/60 border-2 border-gray-800/50 focus:border-red-500/50 rounded-xl px-4 py-3 text-white focus:outline-none transition-all duration-300 hover:bg-black/80"
                    placeholder="7"
                  />
                </div>
              </div>

              {/* Publish toggle */}
              <div>
                <label className="block text-gray-300 text-sm font-bold mb-3">Publish Status</label>
                <select
                  value={formData.published ? 'published' : 'not-published'}
                  onChange={(e) =>
                    setFormData({ ...formData, published: e.target.value === 'published' })
                  }
                  className="w-full bg-black/60 border-2 border-gray-800/50 focus:border-red-500/50 rounded-xl px-4 py-3 text-white focus:outline-none transition-all duration-300 hover:bg-black/80 cursor-pointer"
                >
                  <option value="published">Published</option>
                  <option value="not-published">Not Published</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-6">
                <button
                  onClick={closeEditModal}
                  disabled={isSaving}
                  className="cursor-pointer flex-1 bg-gray-800/50 hover:bg-gray-700/70 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 border-2 border-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 hover:shadow-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSubmit}
                  disabled={!hasChanges() || isSaving}
                  className="cursor-pointer flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-red-500/50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showDeleteModal}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        title="Delete Movie"
        message={`Are you sure you want to delete "${movieToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />

      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-left {
          from { opacity: 0; transform: translateX(30px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.7; }
        }

        .animate-slide-up { animation: slide-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-down { animation: slide-down 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-left { animation: slide-left 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-scale-in { animation: scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }

        .overflow-y-auto::-webkit-scrollbar { width: 10px; }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.4);
          border-radius: 10px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, rgba(220, 38, 38, 0.6), rgba(219, 39, 119, 0.6));
          border-radius: 10px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, rgba(220, 38, 38, 0.8), rgba(219, 39, 119, 0.8));
        }
      `}</style>
    </div>
  );
}
