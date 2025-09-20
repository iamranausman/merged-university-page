'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

import { useUserStore } from '../../store/useUserStore';

const WishlistContext = createContext();

// Helper to generate consistent wishlist key
function getWishlistKey(item) {
  if (!item) return '';
  if (item.label === 'Course' || item.course_id) {
    return `course-${item.id || item.course_id}`;
  }
  if (item.label === 'University' || item.university_id) {
    return `university-${item.id || item.university_id}`;
  }
  return '';
}

export function WishlistProvider({ children }) {

  const {isLoggedIn} = useUserStore();

  const [wishlist, setWishlist] = useState([]);

  // Load wishlist from localStorage or API - only when explicitly called
  const fetchWishlist = useCallback(async () => {
  if (isLoggedIn) {
    try {
      // Sync localStorage to DB on login
      const local = localStorage.getItem('wishlist');
      if (local) {
        const items = JSON.parse(local);

        // Fetch current wishlist state from API to filter out already existing items
        const res = await fetch('/api/frontend/wishlist');
        const data = await res.json();
        const currentWishlist = Array.isArray(data.data) ? data.data : [];

        // Filter out already existing items from the wishlist before sending to the server
        const newItems = items.filter(i =>
          !currentWishlist.some(w =>
            (w.course_id === i.id && i.label === 'Course') ||
            (w.university_id === i.id && i.label === 'University')
          )
        );

        // If there are new items to add
        if (newItems.length > 0) {
          await fetch('/api/frontend/wishlist', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              items: newItems.map(i => ({
                course_id: i.label === 'Course' ? i.id : undefined,
                university_id: i.label === 'University' ? i.id : undefined,
              })),
            }),
          });
          localStorage.removeItem('wishlist'); // Clear the local storage after sending
        }
      }

      // Fetch updated wishlist from API
      const res = await fetch('/api/frontend/wishlist');
      const data = await res.json();
      console.log('🔍 WishlistContext: Fetched wishlist from API:', data);

      if (Array.isArray(data.data)) {
        setWishlist(data.data.map(item => ({
          ...item,
          key: item.course_id ? `course-${item.course_id}` : `university-${item.university_id}`,
          label: item.course_id ? 'Course' : 'University',
          title: item?.course_name || item?.university_name || item.title || item.name,
          image: item.course?.image || item.university?.logo || '/assets/university_icon.png',
          subtitle: item?.university_name || item?.university_address || '',
          id: item.course_id || item.university_id,
          slug: item.course?.slug || item.university?.slug || '',
        })));
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setWishlist([]); // Clear wishlist on error
    }
  } else {
    // For guest users: use localStorage
    const stored = localStorage.getItem('wishlist');
    setWishlist(stored ? JSON.parse(stored) : []);
  }
}, [isLoggedIn]); // Only depend on `isLoggedIn`

  // Only load wishlist on specific pages that need it
  useEffect(() => {
    const pathname = window.location.pathname;
    const wishlistRelatedPages = ['/wishlist', '/comparison', '/institutions', '/courses', '/'];
    
    if (wishlistRelatedPages.some(page => pathname.startsWith(page))) {
      console.log('🔍 WishlistContext: Loading wishlist for page:', pathname);
      fetchWishlist();
    } else {
      console.log('🔍 WishlistContext: Skipping wishlist load for page:', pathname);
    }
  }, [isLoggedIn, fetchWishlist]);

  // Add to wishlist
  const addToWishlist = useCallback(async (item) => {
    const key = getWishlistKey(item);
    if (isLoggedIn) {
      // API add
        const response = await fetch('/api/frontend/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: item.label === 'Course' ? item.id : undefined,
          university_id: item.label === 'University' ? item.id : undefined,
        }),
      });
      
      if (response.ok) {
        // Only update the state after the API request is successful
        setWishlist((prev) => [...prev, { ...item, key }]);
      }
    } else {
      // LocalStorage add
      const updated = [...wishlist, { ...item, key }];
      setWishlist(updated);
      localStorage.setItem('wishlist', JSON.stringify(updated));
    }
  }, [ isLoggedIn ,wishlist]);

  // Remove from wishlist
  const removeFromWishlist = useCallback(async (item) => {
    const key = getWishlistKey(item);
    if (isLoggedIn) {
      await fetch('/api/frontend/wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: item.label === 'Course' ? item.id : undefined,
          university_id: item.label === 'University' ? item.id : undefined,
        }),
      });
      setWishlist((prev) => prev.filter(w => w.key !== key));
    } else {
      const updated = wishlist.filter(w => w.key !== key);
      setWishlist(updated);
      localStorage.setItem('wishlist', JSON.stringify(updated));
    }
  }, [ isLoggedIn, wishlist ]);

  // Toggle wishlist
  const toggleWishlist = (item) => {
    if (isWishlisted(item)) {
      removeFromWishlist(item);
    } else {
      addToWishlist(item);
    }
  };

  // Check if item is wishlisted
  const isWishlisted = (item) => {
    const key = getWishlistKey(item);
    return wishlist.some(w => w.key === key);
  };

  return (
    <WishlistContext.Provider value={{
      wishlist,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      isWishlisted,
      fetchWishlist,
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}