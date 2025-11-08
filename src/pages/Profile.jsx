import '../css/Profile.css'
import React, { useState, useEffect } from 'react';
import { supabase } from '../SupabaseClient';

function Profile() {
  const [patientInfo, setPatientInfo] = useState(null);
  const[loading, setLoading] = useState(true);
  const[error, setError] = useState(null);

  useEffect(() => {
    const fetchPatientInfo = async () => {
      try {
        const { data, error } = await supabase
          .from('patients')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) throw error;
      setPatientInfo(data);
    } catch (err) {
      console.error('Error fetching patient data:', err);
      setError(err.message);
    } finally {
        setLoading(false);
    }
  };

    fetchPatientInfo();
}, []);

if (loading) return <p>Loading patient profile</p>;
if (error) return <p>Error: {error}</p>;
if (!patientInfo) return <p>No data found.</p>;
  
return (
  <div className="profile-page">
    <h1>Patient Profile</h1>
    <div className="profile-container">
      <div className ="profile-card">
        <div className="profile-picture-container">
          <img
            src={patientInfo.profilePicture}
            alt={`${patientInfo.name}'s profile picture`}
            className="profile-picture"
            />
        </div>
          
        <h2>Personal Information</h2>
        <p><strong>Name:</strong> {patientInfo.name}</p>
        <p><strong>Date of Birth:</strong> {patientInfo.dateOfBirth}</p>
        <p><strong>Age:</strong> {patientInfo.age}</p>
          
        <p><strong>Contact Information:</strong></p>
        <ul>
          <li>Phone Number: {patientInfo.phone}</li>
          <li>Email: {patientInfo.email}</li>
          <li>Address: {patientInfo.address}</li>
        </ul>
          
        <p><strong>Emergency Contact Information:</strong></p>
        <ul>
          <li>Name: {patientInfo.emergencyContactName}</li>
          <li>Relationship: {patientInfo.emergencyContactRelationship}</li>
          <li>Phone Number: {patientInfo.emergencyContactPhone}</li>
        </ul>
          
        <p><strong>Provider Name:</strong> {patientInfo.providerName}</p>

        <h2>Insurance Information</h2>
        <ul>
          <li>Provider: {patientInfo.insuranceProvider}</li>
          <li>Policy Number: {patientInfo.policyNumber}</li>
          <li>Group Number: {patientInfo.groupNumber}</li>
        </ul>
        </div>
      </div>
    </div>
  );
}

export default Profile
