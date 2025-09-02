import { UserProfile, useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";

const ReviewSettings = () => {
  const { user } = useUser();
  const [showProfileIcon, setShowProfileIcon] = useState(false);
  const [userFlair, setUserFlair] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    if (user && user.publicMetadata) {
      setShowProfileIcon(user.publicMetadata.showProfileIcon || false);
      setUserFlair(user.publicMetadata.userFlair || "");
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    setSaveMessage("");

    try {
      await user.update({
        publicMetadata: {
          ...user.publicMetadata,
          showProfileIcon,
          userFlair,
        },
      });
      setSaveMessage("Settings saved successfully!");
    } catch (error) {
      console.error("Error updating user metadata:", error);
      setSaveMessage("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="review-settings-container">
      <h3>Review Settings</h3>
      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={showProfileIcon}
            onChange={(e) => setShowProfileIcon(e.target.checked)}
          />
          Show profile icon on my reviews and replies
        </label>
      </div>
      <div className="form-group">
        <label htmlFor="userFlair">Custom Flair</label>
        <input
          id="userFlair"
          type="text"
          value={userFlair}
          onChange={(e) => setUserFlair(e.target.value)}
          placeholder="e.g., Snack Enthusiast"
        />
      </div>
      <button onClick={handleSave} disabled={isSaving}>
        {isSaving ? "Saving..." : "Save Settings"}
      </button>
      {saveMessage && <p className="save-message">{saveMessage}</p>}
    </div>
  );
};

const UserProfilePage = () => {
  const pageStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '40px',
    minHeight: 'calc(100vh - var(--navbar-height, 70px))',
    padding: '20px',
    boxSizing: 'border-box',
  };

  return (
    <div style={pageStyle}>
      <ReviewSettings />
      <UserProfile path="/user-profile" routing="path" />
    </div>
  );
};

export default UserProfilePage;
