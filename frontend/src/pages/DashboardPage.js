import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Trash,
  Plus,
  BarChart3,
  ExternalLink,
  Copy,
  Eye,
  LogOut,
  FileText,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Menu,
  X
} from "lucide-react";

// 🔁 Import shared utilities
import {
  handlePublish,
  handleCopy,
  getStatusIcon,
  getStatusColor
} from "../utils/formUtils"; // Adjust path as needed

export default function DashboardPage() {
  const [publicForms, setPublicForms] = useState([]);
  const [myForms, setMyForms] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [publishingId, setPublishingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, formId: null, formTitle: '' });
  const navigate = useNavigate();
  const URL = process.env.REACT_APP_URL || "http://localhost:5000";

  // Logout handler
  const handleLogout = async() => {
    try {
      await axios.post(`${URL}/api/users/logout`);

    } catch (error) {
      console.error("Logout error:", error);
    } finally {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
    setMobileMenuOpen(false);
    }
  };

  const openDeleteModal = (formId, formTitle) => {
    setDeleteModal({ isOpen: true, formId, formTitle });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, formId: null, formTitle: '' });
  };

  const handleDelete = async () => {
    const { formId } = deleteModal;
    const token = localStorage.getItem("token");
    setDeletingId(formId);
    
    try {
      await axios.delete(`${URL}/api/forms/${formId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLoading(!loading); // Re-fetch forms after deletion
      closeDeleteModal();
    } catch (err) {
      window.alert(err.response?.data?.message || "Failed to delete the form");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`${URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));

    axios
      .get(`${URL}/api/forms/public`)
      .then((res) => setPublicForms(res.data))
      .catch(() => setPublicForms([]));

    if (token) {
      axios
        .get(`${URL}/api/forms`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setMyForms(res.data))
        .catch(() => setMyForms([]));
    }
  }, [loading]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">FormBuilder</h1>
                <p className="text-xs sm:text-sm text-gray-500 truncate">
                  {user ? `Welcome back, ${user.name}` : "Browse available forms"}
                </p>
              </div>
            </div>
            
            {user && (
              <>
                {/* Desktop Actions */}
                <div className="hidden sm:flex items-center space-x-3">
                  <button
                    onClick={() => navigate("/generate")}
                    className="inline-flex items-center px-3 py-2 lg:px-4 lg:py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm"
                  >
                    <Plus className="w-4 h-4 mr-1 lg:mr-2" />
                    <span className="hidden lg:inline">Create Form</span>
                    <span className="lg:hidden">Create</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="sm:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors duration-200"
                >
                  {mobileMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          {user && mobileMenuOpen && (
            <div className="sm:hidden border-t border-gray-200 py-3 space-y-2">
              <button
                onClick={() => {
                  navigate("/generate");
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center px-3 py-2 text-left text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-3" />
                Create Form
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 text-left text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {user && (
          <section className="mb-8 sm:mb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">My Forms</h2>
                <p className="text-sm sm:text-base text-gray-600 mt-1">Manage and track your created forms</p>
              </div>
              <div className="text-xs sm:text-sm text-gray-500">
                {myForms.length} {myForms.length === 1 ? 'form' : 'forms'}
              </div>
            </div>

            {myForms.length === 0 ? (
              <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-6 sm:p-12 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                </div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No forms yet</h3>
                <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">Get started by creating your first form</p>
                <button
                  onClick={() => navigate("/generate")}
                  className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Create Your First Form
                </button>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {myForms.map((form) => (
                  <div
                    key={form._id}
                    className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between mb-3 sm:mb-2">
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                            {form.title}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-1 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium border ${getStatusColor(form.status)} self-start sm:self-auto`}>
                            {getStatusIcon(form.status)}
                            <span className="ml-1 capitalize">{form.status}</span>
                          </span>
                        </div>
                        {form.description && (
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {form.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 sm:pt-4 border-t border-gray-100 space-y-3 sm:space-y-0">
                      
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => navigate(`/form/${form._id}/responses`)}
                          className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors duration-200"
                        >
                          <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          Responses
                        </button>
                        
                        <button
                          onClick={() => navigate(`/form/${form._id}`)}
                          className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200"
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          Preview
                        </button>

                        {form.status === "draft" && (
                          <button
                            onClick={() =>
                              handlePublish({
                                formId: form._id,
                                setPublishingId,
                                setLoading,
                                loading,
                                URL
                              })
                            }
                            disabled={publishingId === form._id}
                            className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors duration-200 disabled:opacity-50"
                          >
                            {publishingId === form._id ? (
                              <>
                                <div className="w-3 h-3 sm:w-4 sm:h-4 mr-1 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                                <span className="hidden sm:inline">Publishing...</span>
                                <span className="sm:hidden">...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                Publish
                              </>
                            )}
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleCopy(form._id, setCopied)}
                          className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200"
                        >
                          <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          Share
                        </button>

                        <button
                          onClick={() => openDeleteModal(form._id, form.title)}
                          disabled={deletingId === form._id}
                          className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200 disabled:opacity-50"
                        >
                          {deletingId === form._id ? (
                            <>
                              <div className="w-3 h-3 sm:w-4 sm:h-4 mr-1 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                              <span className="hidden sm:inline">Deleting...</span>
                              <span className="sm:hidden">...</span>
                            </>
                          ) : (
                            <>
                              <Trash className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              <span className="hidden sm:inline">Delete</span>
                              <span className="sm:hidden">Del</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Public Forms</h2>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Discover and fill out available forms</p>
            </div>
            <div className="text-xs sm:text-sm text-gray-500">
              {publicForms.length} available
            </div>
          </div>

          {publicForms.length === 0 ? (
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-6 sm:p-12 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No public forms</h3>
              <p className="text-sm sm:text-base text-gray-500">Check back later for new forms to fill out</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {publicForms.map((form) => (
                <div
                  key={form._id}
                  className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-all duration-200 group cursor-pointer"
                  onClick={() => navigate(`/form/${form._id}`)}
                >
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex-1 min-w-0 pr-2">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {form.title}
                      </h3>
                      {form.description && (
                        <p className="text-gray-600 text-sm line-clamp-3">
                          {form.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-100">
                    <span className="text-xs sm:text-sm text-gray-500">Click to fill out</span>
                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full mx-4 transform transition-all duration-200 scale-100">
            <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 bg-red-100 rounded-full">
              <Trash className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
            </div>
            
            <div className="text-center mb-6 sm:mb-8">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                Delete Form
              </h3>
              <p className="text-gray-600 text-sm sm:text-base mb-3">
                Are you sure you want to delete <span className="font-medium text-gray-900">"{deleteModal.formTitle}"</span>?
              </p>
              <p className="text-red-600 text-sm font-medium">
                This action cannot be undone and all form responses will be permanently lost.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={closeDeleteModal}
                className="flex-1 px-4 py-2.5 sm:py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200 order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deletingId === deleteModal.formId}
                className="flex-1 px-4 py-2.5 sm:py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
              >
                {deletingId === deleteModal.formId ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Deleting...
                  </div>
                ) : (
                  'Delete Form'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {copied && (
        <div className="fixed bottom-4 left-4 right-4 sm:bottom-6 sm:right-6 sm:left-auto bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-in slide-in-from-bottom-2 duration-300 z-50">
          <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
          <span className="text-sm font-medium">Link copied to clipboard!</span>
        </div>
      )}

      {/* Mobile menu overlay */}
      {user && mobileMenuOpen && (
        <div 
          className="sm:hidden fixed inset-0 bg-black bg-opacity-25 z-10"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}