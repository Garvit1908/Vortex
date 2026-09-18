import React from 'react';
import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Web Development',
  'Mobile Development',
  'UI/UX & Design',
  'AI & Machine Learning',
  'DevOps & Cloud',
  'Writing & Translation',
  'Digital Marketing',
  'Video & Audio',
];

export const SearchFilterBar = ({
  search,
  setSearch,
  selectedCategory,
  setSelectedCategory,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  minRating,
  setMinRating,
  sort,
  setSort,
  onReset,
}) => {
  return (
    <div className="space-y-4 mb-8">
      {/* Search Input and Sort Row */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 text-[#9EA96F] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search gigs by skill, keyword, or technology (e.g. React, Figma, Docker)..."
            className="w-full pl-12 pr-4 py-3 bg-white/90 border border-[#9EA96F]/25 focus:border-[#CDDE42] focus:ring-2 focus:ring-[#CDDE42]/20 rounded-2xl text-sm text-[#1C220E] placeholder-[#1C220E]/40 outline-none transition shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Sort selector */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-4 py-3 bg-white/90 border border-[#9EA96F]/25 rounded-2xl text-xs font-semibold text-[#1C220E] outline-none hover:border-[#9EA96F]/40 focus:border-[#CDDE42] transition shadow-xs"
          >
            <option value="newest">Newest First</option>
            <option value="rating">Top Rated</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="delivery">Fastest Delivery</option>
          </select>

          {/* Reset Filters */}
          <button
            onClick={onReset}
            title="Reset Filters"
            className="p-3 rounded-2xl bg-white/90 border border-[#9EA96F]/25 text-[#1C220E]/70 hover:text-[#1C220E] hover:bg-[#F2F6B1]/40 transition shadow-xs"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category Horizontal Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isSelected = (cat === 'All' && !selectedCategory) || selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === 'All' ? '' : cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                isSelected
                  ? 'bg-[#1C220E] text-[#CDDE42] shadow-sm font-bold'
                  : 'bg-white/80 text-[#1C220E]/70 border border-[#9EA96F]/20 hover:text-[#1C220E] hover:bg-[#F2F6B1]/40 hover:border-[#CDDE42] shadow-xs'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Numerical Filters: Price and Rating */}
      <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-[#1C220E]/70">
        <span className="font-bold text-[#1C220E] flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#758045]" />
          Filter By:
        </span>

        {/* Min Price */}
        <div className="flex items-center gap-1.5">
          <span>Min ₹</span>
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="0"
            className="w-20 px-2.5 py-1 bg-white border border-[#9EA96F]/25 rounded-lg text-[#1C220E] outline-none focus:border-[#CDDE42] shadow-xs"
          />
        </div>

        {/* Max Price */}
        <div className="flex items-center gap-1.5">
          <span>Max ₹</span>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="50000"
            className="w-24 px-2.5 py-1 bg-white border border-[#9EA96F]/25 rounded-lg text-[#1C220E] outline-none focus:border-[#CDDE42] shadow-xs"
          />
        </div>

        {/* Min Rating */}
        <div className="flex items-center gap-1.5">
          <span>Rating:</span>
          <select
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            className="px-2.5 py-1 bg-white border border-[#9EA96F]/25 rounded-lg text-[#1C220E] outline-none focus:border-[#CDDE42] shadow-xs"
          >
            <option value="">Any</option>
            <option value="4.5">★ 4.5 & up</option>
            <option value="4.0">★ 4.0 & up</option>
            <option value="3.0">★ 3.0 & up</option>
          </select>
        </div>
      </div>
    </div>
  );
};
