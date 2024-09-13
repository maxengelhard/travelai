const SideBar = ({ userInfo }) => (
    <div className="bg-gray-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
      <h2 className="text-2xl font-semibold text-center">User Dashboard</h2>
      <nav>
        <div className="space-y-3">
          <div>Email: {userInfo.email}</div>
          <div>Plan: {userInfo.plan_type}</div>
          <div>Credits: {userInfo.credits}</div>
          <div>Plan Start: {new Date(userInfo.plan_start_date).toLocaleDateString()}</div>
          <div>Plan End: {new Date(userInfo.plan_end_date).toLocaleDateString()}</div>
        </div>
      </nav>
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Initial Prompt</h3>
        <p>{userInfo.initial_prompt}</p>
      </div>
    </div>
  );

export default SideBar;