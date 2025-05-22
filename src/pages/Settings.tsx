import { useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("general");
  const [generalSettings, setGeneralSettings] = useState({
    storeName: "YODY Store Admin",
    storeEmail: "admin@yody.vn",
    storePhone: "1900 2009",
    currency: "VND",
    language: "vi",
    timeZone: "Asia/Ho_Chi_Minh",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    orderConfirmation: true,
    orderStatusChange: true,
    lowStockAlert: true,
    newCustomer: true,
    marketingEmail: false,
    systemUpdates: true,
  });

  const [userSettings, setUserSettings] = useState({
    name: "Admin",
    email: "admin@yody.vn",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    avatar: null as File | null,
    avatarPreview: "/images/user/admin-avatar.png",
  });

  const handleGeneralSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setGeneralSettings({
      ...generalSettings,
      [name]: value,
    });
  };

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotificationSettings({
      ...notificationSettings,
      [name]: checked,
    });
  };

  const handleUserSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    
    if (name === "avatar" && files && files.length > 0) {
      const file = files[0];
      setUserSettings({
        ...userSettings,
        avatar: file,
        avatarPreview: URL.createObjectURL(file),
      });
    } else {
      setUserSettings({
        ...userSettings,
        [name]: value,
      });
    }
  };

  const handleGeneralSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("General settings saved successfully!");
  };

  const handleNotificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Notification settings saved successfully!");
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (userSettings.newPassword !== userSettings.confirmPassword) {
      alert("New password and confirm password do not match!");
      return;
    }
    
    alert("User settings saved successfully!");
  };

  return (
    <div>
      <PageMeta
        title="Settings | YODY Admin Dashboard"
        description="Configure your YODY store settings, notifications, and user preferences"
      />
      <PageBreadcrumb pageTitle="Settings" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Tabs navigation */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
              Settings
            </h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setActiveTab("general")}
                className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-left transition-colors ${
                  activeTab === "general"
                    ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                    : "hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                }`}
              >
                <svg
                  className="size-5"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M1.66699 10.7584V9.2417C1.66699 8.41003 2.34866 7.73337 3.17199 7.73337C4.61699 7.73337 5.21866 6.75003 4.49866 5.4917C4.09866 4.83337 4.31699 3.9917 4.98366 3.58337L6.47533 2.7417C7.05033 2.4167 7.78366 2.61003 8.10866 3.18337L8.19033 3.3167C8.90199 4.5667 9.99866 4.5667 10.7186 3.3167L10.8003 3.18337C11.1253 2.61003 11.8586 2.4167 12.4336 2.7417L13.9253 3.58337C14.592 3.9917 14.8103 4.83337 14.4103 5.4917C13.6903 6.75003 14.292 7.73337 15.737 7.73337C16.5603 7.73337 17.242 8.40003 17.242 9.2417V10.7584C17.242 11.5901 16.5603 12.2667 15.737 12.2667C14.292 12.2667 13.6903 13.25 14.4103 14.5084C14.8103 15.1667 14.592 16.0084 13.9253 16.4167L12.4336 17.2584C11.8586 17.5834 11.1253 17.3901 10.8003 16.8167L10.7186 16.6834C10.007 15.4334 8.91033 15.4334 8.19033 16.6834L8.10866 16.8167C7.78366 17.3901 7.05033 17.5834 6.47533 17.2584L4.98366 16.4167C4.31699 16.0084 4.09866 15.1667 4.49866 14.5084C5.21866 13.25 4.61699 12.2667 3.17199 12.2667C2.34866 12.2667 1.66699 11.5901 1.66699 10.7584Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>General</span>
              </button>
              <button
                onClick={() => setActiveTab("notifications")}
                className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-left transition-colors ${
                  activeTab === "notifications"
                    ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                    : "hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                }`}
              >
                <svg
                  className="size-5"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.0003 2.5C7.25033 2.5 5.00033 4.75 5.00033 7.5V9.56667C5.00033 10.0333 4.82533 10.7333 4.60033 11.1333L3.75033 12.7C3.25033 13.6833 3.58366 14.7667 4.6337 15.15C8.35036 16.4833 11.6503 16.4833 15.367 15.15C16.3337 14.8 16.7003 13.6333 16.2337 12.7L15.3837 11.1333C15.167 10.7333 14.9837 10.025 14.9837 9.56667V7.5C15.0003 4.78333 12.7337 2.5 10.0003 2.5Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                  />
                  <path
                    d="M11.5837 2.84167C10.5337 2.55 9.45866 2.55 8.40866 2.84167C8.64199 2.16667 9.26699 1.66667 10.0003 1.66667C10.7337 1.66667 11.3587 2.16667 11.5837 2.84167Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12.5003 15.4167C12.5003 16.9833 11.3503 18.25 10.0003 18.25C9.33366 18.25 8.70866 17.9917 8.25033 17.55C7.79199 17.1083 7.50033 16.5 7.50033 15.8333"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeMiterlimit="10"
                  />
                </svg>
                <span>Notifications</span>
              </button>
              <button
                onClick={() => setActiveTab("user")}
                className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-left transition-colors ${
                  activeTab === "user"
                    ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                    : "hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                }`}
              >
                <svg
                  className="size-5"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.1337 9.00001C10.0503 8.99168 9.95033 8.99168 9.85866 9.00001C7.87533 8.93335 6.30033 7.30835 6.30033 5.30835C6.30033 3.25835 7.95866 1.60001 10.0003 1.60001C12.0337 1.60001 13.7003 3.25835 13.7003 5.30835C13.692 7.30835 12.117 8.93335 10.1337 9.00001Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5.97199 12.1417C3.95866 13.4917 3.95866 15.7 5.97199 17.0417C8.25866 18.5583 12.0253 18.5583 14.312 17.0417C16.3253 15.6917 16.3253 13.4833 14.312 12.1417C12.0337 10.6333 8.26699 10.6333 5.97199 12.1417Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>User Settings</span>
              </button>
            </div>
          </div>
        </div>

        {/* Settings content */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            {/* General Settings */}
            {activeTab === "general" && (
              <div>
                <h3 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
                  General Settings
                </h3>
                <form onSubmit={handleGeneralSubmit}>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="storeName" className="mb-2 block text-gray-700 dark:text-white/80">
                        Store Name
                      </label>
                      <input
                        type="text"
                        id="storeName"
                        name="storeName"
                        value={generalSettings.storeName}
                        onChange={handleGeneralSettingsChange}
                        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-600 focus:border-brand-500 focus:ring-0 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90"
                      />
                    </div>
                    <div>
                      <label htmlFor="storeEmail" className="mb-2 block text-gray-700 dark:text-white/80">
                        Store Email
                      </label>
                      <input
                        type="email"
                        id="storeEmail"
                        name="storeEmail"
                        value={generalSettings.storeEmail}
                        onChange={handleGeneralSettingsChange}
                        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-600 focus:border-brand-500 focus:ring-0 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90"
                      />
                    </div>
                    <div>
                      <label htmlFor="storePhone" className="mb-2 block text-gray-700 dark:text-white/80">
                        Store Phone
                      </label>
                      <input
                        type="text"
                        id="storePhone"
                        name="storePhone"
                        value={generalSettings.storePhone}
                        onChange={handleGeneralSettingsChange}
                        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-600 focus:border-brand-500 focus:ring-0 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90"
                      />
                    </div>
                    <div>
                      <label htmlFor="currency" className="mb-2 block text-gray-700 dark:text-white/80">
                        Currency
                      </label>
                      <select
                        id="currency"
                        name="currency"
                        value={generalSettings.currency}
                        onChange={handleGeneralSettingsChange}
                        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-600 focus:border-brand-500 focus:ring-0 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90"
                      >
                        <option value="VND">VND - Vietnamese Dong</option>
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="language" className="mb-2 block text-gray-700 dark:text-white/80">
                        Language
                      </label>
                      <select
                        id="language"
                        name="language"
                        value={generalSettings.language}
                        onChange={handleGeneralSettingsChange}
                        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-600 focus:border-brand-500 focus:ring-0 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90"
                      >
                        <option value="vi">Vietnamese</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="timeZone" className="mb-2 block text-gray-700 dark:text-white/80">
                        Time Zone
                      </label>
                      <select
                        id="timeZone"
                        name="timeZone"
                        value={generalSettings.timeZone}
                        onChange={handleGeneralSettingsChange}
                        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-600 focus:border-brand-500 focus:ring-0 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90"
                      >
                        <option value="Asia/Ho_Chi_Minh">Asia/Ho Chi Minh (GMT+7)</option>
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">America/New York (GMT-4)</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-6">
                    <button
                      type="submit"
                      className="rounded-lg bg-brand-500 px-5 py-2.5 font-medium text-gray-800 hover:bg-brand-600"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === "notifications" && (
              <div>
                <h3 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
                  Notification Settings
                </h3>
                <form onSubmit={handleNotificationSubmit}>
                  <div className="space-y-5">
                    <div className="flex items-start">
                      <div className="flex h-6 items-center">
                        <input
                          id="orderConfirmation"
                          name="orderConfirmation"
                          type="checkbox"
                          checked={notificationSettings.orderConfirmation}
                          onChange={handleNotificationChange}
                          className="h-5 w-5 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                        />
                      </div>
                      <div className="ml-3">
                        <label htmlFor="orderConfirmation" className="font-medium text-gray-800 dark:text-white/90">
                          Order Confirmation
                        </label>
                        <p className="text-gray-500 text-theme-sm dark:text-gray-400">
                          Receive notifications when a new order is placed
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex h-6 items-center">
                        <input
                          id="orderStatusChange"
                          name="orderStatusChange"
                          type="checkbox"
                          checked={notificationSettings.orderStatusChange}
                          onChange={handleNotificationChange}
                          className="h-5 w-5 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                        />
                      </div>
                      <div className="ml-3">
                        <label htmlFor="orderStatusChange" className="font-medium text-gray-800 dark:text-white/90">
                          Order Status Change
                        </label>
                        <p className="text-gray-500 text-theme-sm dark:text-gray-400">
                          Receive notifications when an order status changes
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex h-6 items-center">
                        <input
                          id="lowStockAlert"
                          name="lowStockAlert"
                          type="checkbox"
                          checked={notificationSettings.lowStockAlert}
                          onChange={handleNotificationChange}
                          className="h-5 w-5 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                        />
                      </div>
                      <div className="ml-3">
                        <label htmlFor="lowStockAlert" className="font-medium text-gray-800 dark:text-white/90">
                          Low Stock Alert
                        </label>
                        <p className="text-gray-500 text-theme-sm dark:text-gray-400">
                          Get alerts when products are running low on inventory
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex h-6 items-center">
                        <input
                          id="newCustomer"
                          name="newCustomer"
                          type="checkbox"
                          checked={notificationSettings.newCustomer}
                          onChange={handleNotificationChange}
                          className="h-5 w-5 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                        />
                      </div>
                      <div className="ml-3">
                        <label htmlFor="newCustomer" className="font-medium text-gray-800 dark:text-white/90">
                          New Customer
                        </label>
                        <p className="text-gray-500 text-theme-sm dark:text-gray-400">
                          Receive notifications when a new customer registers
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex h-6 items-center">
                        <input
                          id="marketingEmail"
                          name="marketingEmail"
                          type="checkbox"
                          checked={notificationSettings.marketingEmail}
                          onChange={handleNotificationChange}
                          className="h-5 w-5 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                        />
                      </div>
                      <div className="ml-3">
                        <label htmlFor="marketingEmail" className="font-medium text-gray-800 dark:text-white/90">
                          Marketing Emails
                        </label>
                        <p className="text-gray-500 text-theme-sm dark:text-gray-400">
                          Receive marketing emails and newsletters
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex h-6 items-center">
                        <input
                          id="systemUpdates"
                          name="systemUpdates"
                          type="checkbox"
                          checked={notificationSettings.systemUpdates}
                          onChange={handleNotificationChange}
                          className="h-5 w-5 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                        />
                      </div>
                      <div className="ml-3">
                        <label htmlFor="systemUpdates" className="font-medium text-gray-800 dark:text-white/90">
                          System Updates
                        </label>
                        <p className="text-gray-500 text-theme-sm dark:text-gray-400">
                          Get notified about system updates and new features
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <button
                      type="submit"
                      className="rounded-lg bg-brand-500 px-5 py-2.5 font-medium text-gray-800 hover:bg-brand-600"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* User Settings */}
            {activeTab === "user" && (
              <div>
                <h3 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
                  User Settings
                </h3>
                <form onSubmit={handleUserSubmit}>
                  <div className="mb-6 flex items-center">
                    <div className="mr-5">
                      <div className="relative h-24 w-24 overflow-hidden rounded-full">
                        <img
                          src={userSettings.avatarPreview}
                          alt="User avatar"
                          className="h-full w-full object-cover"
                        />
                        <label
                          htmlFor="avatar"
                          className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black bg-opacity-50 opacity-0 transition-opacity hover:opacity-100"
                        >
                          <svg
                            className="size-8 text-white"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M12 16C13.6569 16 15 14.6569 15 13C15 11.3431 13.6569 10 12 10C10.3431 10 9 11.3431 9 13C9 14.6569 10.3431 16 12 16Z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M3 16.8V9.2C3 8.0799 3 7.51984 3.21799 7.09202C3.40973 6.71569 3.71569 6.40973 4.09202 6.21799C4.51984 6 5.0799 6 6.2 6H7.25464C7.37758 6 7.43905 6 7.49576 5.9935C7.79166 5.95961 8.05705 5.79559 8.21969 5.54609C8.25086 5.49827 8.27836 5.44328 8.33333 5.33333C8.44329 5.11342 8.49827 5.00346 8.56062 4.90782C8.8859 4.40882 9.41668 4.08078 10.0085 4.01299C10.1219 4 10.2448 4 10.4907 4H13.5093C13.7552 4 13.8781 4 13.9915 4.01299C14.5833 4.08078 15.1141 4.40882 15.4394 4.90782C15.5017 5.00345 15.5567 5.11345 15.6667 5.33333C15.7216 5.44329 15.7491 5.49827 15.7803 5.54609C15.943 5.79559 16.2083 5.95961 16.5042 5.9935C16.561 6 16.6224 6 16.7454 6H17.8C18.9201 6 19.4802 6 19.908 6.21799C20.2843 6.40973 20.5903 6.71569 20.782 7.09202C21 7.51984 21 8.0799 21 9.2V16.8C21 17.9201 21 18.4802 20.782 18.908C20.5903 19.2843 20.2843 19.5903 19.908 19.782C19.4802 20 18.9201 20 17.8 20H6.2C5.0799 20 4.51984 20 4.09202 19.782C3.71569 19.5903 3.40973 19.2843 3.21799 18.908C3 18.4802 3 17.9201 3 16.8Z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </label>
                      </div>
                      <input
                        id="avatar"
                        name="avatar"
                        type="file"
                        accept="image/*"
                        onChange={handleUserSettingsChange}
                        className="hidden"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-white/90">Profile Photo</h4>
                      <p className="text-gray-500 text-theme-sm dark:text-gray-400">
                        Click on the image to change your profile photo
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="mb-2 block text-gray-700 dark:text-white/80">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={userSettings.name}
                        onChange={handleUserSettingsChange}
                        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-600 focus:border-brand-500 focus:ring-0 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="mb-2 block text-gray-700 dark:text-white/80">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={userSettings.email}
                        onChange={handleUserSettingsChange}
                        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-600 focus:border-brand-500 focus:ring-0 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90"
                      />
                    </div>
                  </div>

                  <h4 className="mb-4 mt-6 font-medium text-gray-800 dark:text-white/90">
                    Change Password
                  </h4>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="currentPassword" className="mb-2 block text-gray-700 dark:text-white/80">
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={userSettings.currentPassword}
                        onChange={handleUserSettingsChange}
                        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-600 focus:border-brand-500 focus:ring-0 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90"
                      />
                    </div>
                    <div className="sm:col-span-2 sm:grid sm:grid-cols-2 sm:gap-6">
                      <div>
                        <label htmlFor="newPassword" className="mb-2 block text-gray-700 dark:text-white/80">
                          New Password
                        </label>
                        <input
                          type="password"
                          id="newPassword"
                          name="newPassword"
                          value={userSettings.newPassword}
                          onChange={handleUserSettingsChange}
                          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-600 focus:border-brand-500 focus:ring-0 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90"
                        />
                      </div>
                      <div>
                        <label htmlFor="confirmPassword" className="mb-2 block text-gray-700 dark:text-white/80">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={userSettings.confirmPassword}
                          onChange={handleUserSettingsChange}
                          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-600 focus:border-brand-500 focus:ring-0 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      type="submit"
                      className="rounded-lg bg-brand-500 px-5 py-2.5 font-medium text-gray-800 hover:bg-brand-600"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
