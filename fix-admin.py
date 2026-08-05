with open('src/components/AdminPanel.tsx', 'r') as f:
    content = f.read()

bad_str = """                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[420px] overflow-y-auto pr-2 no-sc                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">"""

replacement = """                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[420px] overflow-y-auto pr-2 no-scrollbar">
                            {filtered.map((override, idx) => (
                              <div key={idx} className="p-4 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-2xl flex justify-between items-start gap-3 shadow-sm hover:shadow transition-all group">
                                <div className="space-y-1 text-xs">
                                  <div className="font-semibold text-gray-800 dark:text-gray-100">{override.course}</div>
                                  <div className="text-[10px] text-gray-500">{override.institution}</div>
                                  {override.explanation && (
                                    <div className="text-[10px] text-gray-400 italic mt-1 bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg">
                                      "{override.explanation}"
                                    </div>
                                  )}
                                  {override.institutionalCutoff && (
                                    <div className="text-[9px] text-blue-500 font-semibold uppercase mt-1">
                                      Uni Floor Limit: {override.institutionalCutoff}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                  <div className="px-2.5 py-1 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-[10px] font-extrabold rounded-lg tracking-wider">
                                    {override.departmentalCutoff}
                                  </div>
                                  <button
                                    onClick={() => handleDeleteOverride(override.institution, override.course)}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg active:scale-90 transition-all"
                                    aria-label="Delete override rule"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()
                    )}
                  </div>
                </div>
              )}

              {/* ── CONTENT TAB ── */}
              {activeTab === 'content' && (
                <div className="space-y-8">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">"""

content = content.replace(bad_str, replacement)

# Now fix the trailing duplicate garbage at the end of the replaced block
bad_str_end = """                          {showPostForm ? 'Cancel' : 'Manual'}
                        </button>
                      </div>
                    </div>
                  </div>dark:bg-gray-700 text-amber-600 shadow-sm' : 'text-gray-400'}`}
                        >
                          Pending
                          {publishedNews.filter(n => !n.isLive).length > 0 && (
                            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                          )}
                        </button>
                      </div>
                      <div className="flex gap-2 flex-wrap border-l border-gray-200 dark:border-gray-800 pl-4">
                        <button onClick={handlePurgeAllNews} disabled={isContentLoading} className="px-4 py-2 bg-red-600/90 hover:bg-red-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2 active:scale-95"><Trash2 size={12} /> Purge</button>
                        <button onClick={handleFixFutureDates} disabled={isContentLoading} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2 active:scale-95"><Clock size={12} /> Fix Future</button>
                        <button onClick={handleSyncLiveNews} disabled={isContentLoading} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2">
                          {isContentLoading ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />} AI Sync
                        </button>
                        <button
                          onClick={() => {
                            setShowAIBlogForm(!showAIBlogForm);
                            setShowPostForm(false);
                            setAiGeneratedPost(null);
                          }}
                          className="px-4 py-2 bg-purple-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2"
                        >
                          <Sparkles size={12} /> AI Blog
                        </button>
                        <button
                          onClick={() => {
                            if (!showPostForm) {
                              setNewPost({ category: 'National' });
                            }
                            setShowPostForm(!showPostForm);
                            setShowAIBlogForm(false);
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase"
                        >
                          {showPostForm ? 'Cancel' : 'Manual'}
                        </button>
                      </div>
                    </div>
                  </div>"""

replacement_end = """                          {showPostForm ? 'Cancel' : 'Manual'}
                        </button>
                      </div>
                    </div>
                  </div>"""

content = content.replace(bad_str_end, replacement_end)

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(content)
