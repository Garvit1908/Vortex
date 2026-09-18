import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import { GigCard } from '../features/listings/GigCard';
import { SearchFilterBar } from '../features/listings/SearchFilterBar';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const ExplorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [minRating, setMinRating] = useState(searchParams.get('minRating') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  const [gigs, setGigs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 9, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);

  // Sync state to URL params
  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (selectedCategory) params.category = selectedCategory;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (minRating) params.minRating = minRating;
    if (sort) params.sort = sort;
    if (page > 1) params.page = page.toString();

    setSearchParams(params, { replace: true });
  }, [search, selectedCategory, minPrice, maxPrice, minRating, sort, page]);

  // Fetch gigs from backend
  const fetchGigs = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page,
        limit: 9,
        ...(search && { search }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(minPrice && { minPrice }),
        ...(maxPrice && { maxPrice }),
        ...(minRating && { minRating }),
        ...(sort && { sort }),
      }).toString();

      const res = await api.get(`/gigs?${query}`);
      if (res.data.success) {
        setGigs(res.data.gigs);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to load gigs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGigs();
  }, [search, selectedCategory, minPrice, maxPrice, minRating, sort, page]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setSort('newest');
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-[#1C220E] uppercase font-display tracking-tight flex items-center gap-2.5">
          <Layers className="w-8 h-8 text-[#758045]" />
          <span>Explore Freelance Services</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#1C220E]/60 mt-1">
          Showing {pagination.total} verified gigs available across tech, design, and digital domains
        </p>
      </div>

      {/* Filter and Search Bar */}
      <SearchFilterBar
        search={search}
        setSearch={(v) => {
          setSearch(v);
          setPage(1);
        }}
        selectedCategory={selectedCategory}
        setSelectedCategory={(v) => {
          setSelectedCategory(v);
          setPage(1);
        }}
        minPrice={minPrice}
        setMinPrice={(v) => {
          setMinPrice(v);
          setPage(1);
        }}
        maxPrice={maxPrice}
        setMaxPrice={(v) => {
          setMaxPrice(v);
          setPage(1);
        }}
        minRating={minRating}
        setMinRating={(v) => {
          setMinRating(v);
          setPage(1);
        }}
        sort={sort}
        setSort={(v) => {
          setSort(v);
          setPage(1);
        }}
        onReset={handleResetFilters}
      />

      {/* Main Results Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#1C220E]/60">
          <div className="w-10 h-10 border-2 border-[#CDDE42] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-semibold">Filtering verified services...</p>
        </div>
      ) : gigs.length === 0 ? (
        <div className="bg-white/80 p-16 rounded-3xl border border-[#9EA96F]/20 shadow-xs text-center space-y-3 my-8">
          <h3 className="text-base font-bold text-[#1C220E]">No services matched your filters</h3>
          <p className="text-xs text-[#1C220E]/60 max-w-sm mx-auto">
            Try adjusting your search terms, removing specific category filters, or widening the price range.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 bg-[#1C220E] text-[#CDDE42] rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#2E3514] transition inline-block mt-2 shadow-sm"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gigs.map((gig) => (
              <GigCard key={gig._id} gig={gig} />
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-6 border-t border-slate-200">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-4 py-2 bg-white border border-slate-200 disabled:opacity-30 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <span className="text-xs font-bold text-slate-500">
                Page <span className="text-slate-900 font-extrabold">{page}</span> of {pagination.pages}
              </span>

              <button
                disabled={page >= pagination.pages}
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                className="px-4 py-2 bg-white border border-slate-200 disabled:opacity-30 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition flex items-center gap-1.5"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
