
// Copied example patient data from here, https://build.fhir.org/patient-example.json.html 
// mapped what fields I could, not sure if we need to add more fields to the db later to fully flesh it out?
// Only closely tested what I needed for the homepage but it something doesn't make sense, reach out
export function mapToFhirPatient(row) {
  if (!row) return null

  if (row.resource && row.resource.resourceType === 'Patient') return row.resource

  const fullName = row.name || ''
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  const family = parts.length > 1 ? parts.slice(-1).join(' ') : ''
  const given = parts.length > 1 ? parts.slice(0, -1) : [parts[0] || '']

  const patient = {
    resourceType: 'Patient',
    id: row.id?.toString() ?? undefined,
    active: true,
    name: [
      {
        use: 'official',
        text: fullName || undefined,
        family: family || undefined,
        given: given && given.length ? given : undefined
      }
    ]
  }

  if (row.dateOfBirth) patient.birthDate = row.dateOfBirth
  if (row.birthTime) {
    patient.extension = patient.extension || []
    patient.extension.push({ url: 'http://hl7.org/fhir/StructureDefinition/patient-birthTime', valueDateTime: row.birthTime })
  }
  if (row.age !== undefined && row.age !== null) {
    patient.extension = patient.extension || []
    patient.extension.push({ valueInteger: row.age })
  }

  if (row.identifiers) patient.identifier = row.identifiers
  else {
    const ids = []
    if (row.id !== undefined && row.id !== null) {
      ids.push({
        use: 'usual',
        type: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v2-0203', code: 'MR' }] },
        system: 'urn:example:patient-id',
        value: row.id?.toString(),
        assigner: { display: 'Local System' }
      })
    }
    if (row.user_id) ids.push({ system: 'urn:example:user-id', value: row.user_id })
    if (row.policyNumber) ids.push({ use: 'secondary', system: 'urn:example:insurance', value: row.policyNumber, assigner: { display: row.insuranceProvider || undefined } })
    if (ids.length) patient.identifier = ids
  }

  if (row.telecom) patient.telecom = row.telecom
  else {
    const telecom = []
    if (row.phone) telecom.push({ system: 'phone', value: row.phone, use: 'home', rank: 1 })
    if (row.email) telecom.push({ system: 'email', value: row.email, use: 'home', rank: 2 })
    if (telecom.length) patient.telecom = telecom
  }

  if (row.address) patient.address = [{ use: 'home', type: 'both', text: row.address, line: [row.address] }]
  if (row.profilePicture) patient.photo = [{ url: row.profilePicture }]

  if (row.emergencyContactName || row.emergencyContactPhone || row.emergencyContactRelationship) {
    patient.contact = [
      {
        relationship: row.emergencyContactRelationship ? [{ text: row.emergencyContactRelationship }] : undefined,
        name: { text: row.emergencyContactName || undefined },
        telecom: row.emergencyContactPhone ? [{ system: 'phone', value: row.emergencyContactPhone, use: 'mobile' }] : undefined
      }
    ]
  }

  const insuranceExts = []
  if (row.providerName) insuranceExts.push({  valueString: row.providerName })
  if (row.insuranceProvider) insuranceExts.push({  valueString: row.insuranceProvider })
  if (row.policyNumber) insuranceExts.push({  valueString: row.policyNumber })
  if (row.groupNumber) insuranceExts.push({  valueString: row.groupNumber })
  if (insuranceExts.length) {
    patient.extension = patient.extension || []
    patient.extension.push(...insuranceExts)
  }

  if (row.user_id) {
    patient.extension = patient.extension || []
    patient.extension.push({ valueString: row.user_id })
  }

  if (row.conception_date) {
    patient.extension = patient.extension || []
    patient.extension.push({ valueDate: row.conception_date })
  }

  if (row.providerName) patient.managingOrganization = { display: row.providerName }

  return patient
}
