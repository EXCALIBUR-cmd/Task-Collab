import React, { useEffect, useState } from 'react';
import { activityAPI } from '../services/api';

const ActivityPanel = ({ boardId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadActivities = async () => {
      setLoading(true);
      try {
        const response = await activityAPI.getActivities(boardId);
        setActivities(response.data);
      } catch (error) {
        console.error('Failed to load activities:', error);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, [boardId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="activity-panel">
      <h3>Activity</h3>
      {loading ? (
        <div className="loading">Loading activities...</div>
      ) : (
        <div className="activities-list">
          {activities.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div className="activity-content">
                <strong>{activity.user_name || 'Unknown user'}</strong>
                <span className="activity-details">{activity.details}</span>
              </div>
              <span className="activity-time">{formatDate(activity.created_at)}</span>
            </div>
          ))}
          {activities.length === 0 && (
            <p className="empty-state">No activity yet</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityPanel;
