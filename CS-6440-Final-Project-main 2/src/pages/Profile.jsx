import '../css/Profile.css'
import React, { useState, useEffect } from 'react';
import { supabase } from '../SupabaseClient';

function mapToFhirPatient(row) {
  return {
    resourceType: "Patient",
    id: row.id.toString(),
    name: [
      {
        use: "official",
        text: row.name
      }
    ],
    birthDate: row.dateOfBirth,
    telecom: [
      { system: "phone", value: row.phone },
      { system: "email", value: row.email }
    ],
    address: [
      {
        text: row.address
      }
    ],
    photo: row.profilePicture
    ? [{ url: row.profilePicture }]
    : [],
    extension: [
      {
        url: "https://github.gatech.edu/zallen33/CS-6440-Final-Project/fhir/StructureDefinition/conception-date",
        valueDate: row.conception_date || null
      }
    ]
  };
}

function mapToFhirEmergencyContact(row) {
  return {
    resourceType: "RelatedPerson",
    name: [{ text: row.emergencyContactName }],
    telecom: [
      { system: "phone", value: row.emergencyContactPhone }
    ],
    patient: { reference: `Patient/${row.id}` }
  };
}

function mapToFhirInsurance(row) {
  return {
    resourceType: "Coverage",
    subscriber: { reference: `Patient/${row.id}` },
    payor: [{ display: row.insuranceProvider }],
    policyHolder: { reference: `Patient/${row.id}` },
    class: [
      {
        type: { text: "Policy Number" },
        value: row.policyNumber
      },
      {
        type: { text: "Group Number" },
        value: row.groupNumber
      }
    ]
  };
}

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

      const fhirPatient = mapToFhirPatient(data);
      const fhirContact = mapToFhirEmergencyContact(data);
      const fhirInsurance = mapToFhirInsurance(data);

      setPatientInfo({
        raw: data,
        fhir: {
          patient: fhirPatient,
          emergencyContact: fhirContact,
          insurance: fhirInsurance
        }
      });

    } catch (err) {
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
            src={patientInfo.raw.profilePicture}
            alt={`${patientInfo.raw.name}'s profile picture`}
            className="profile-picture"
            />
        </div>
          
        <h2>Personal Information</h2>
        <p><strong>Name:</strong> {patientInfo.raw.name}</p>
        <p><strong>Date of Birth:</strong> {patientInfo.raw.dateOfBirth}</p>
        <p><strong>Age:</strong> {patientInfo.raw.age}</p>
          
        <p><strong>Contact Information:</strong></p>
        <ul>
          <li>Phone Number: {patientInfo.raw.phone}</li>
          <li>Email: {patientInfo.raw.email}</li>
          <li>Address: {patientInfo.raw.address}</li>
        </ul>
          
        <p><strong>Emergency Contact Information:</strong></p>
        <ul>
          <li>Name: {patientInfo.raw.emergencyContactName}</li>
          <li>Relationship: {patientInfo.raw.emergencyContactRelationship}</li>
          <li>Phone Number: {patientInfo.raw.emergencyContactPhone}</li>
        </ul>
          
        <p><strong>Provider Name:</strong> {patientInfo.raw.providerName}</p>

        <h2>Insurance Information</h2>
        <ul>
          <li>Provider: {patientInfo.raw.insuranceProvider}</li>
          <li>Policy Number: {patientInfo.raw.policyNumber}</li>
          <li>Group Number: {patientInfo.raw.groupNumber}</li>
        </ul>
        </div>
      </div>
    </div>
  );
}

export default Profile
