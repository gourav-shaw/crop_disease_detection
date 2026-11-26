// Server-side copy of class metadata — index MUST match ml-service/classes.json
// Exact class order from the training notebook (image_dataset_from_directory class_names):
// Plant Village dataset, 29 classes across 9 crops. Healthy = disease === 'Healthy'.
const DISEASES = [
  { classIndex: 0, code: "APL-SCAB", name: "Apple - Apple Scab", crop: "Apple", disease: "Apple Scab", healthy: false, severity: "Moderate" },
  { classIndex: 1, code: "APL-BLKR", name: "Apple - Black Rot", crop: "Apple", disease: "Black Rot", healthy: false, severity: "Moderate" },
  { classIndex: 2, code: "APL-RUST", name: "Apple - Cedar Apple Rust", crop: "Apple", disease: "Cedar Apple Rust", healthy: false, severity: "Moderate" },
  { classIndex: 3, code: "APL-HLTY", name: "Apple - Healthy", crop: "Apple", disease: "Healthy", healthy: true, severity: "None" },
  { classIndex: 4, code: "PEP-BACT", name: "Bell Pepper - Bacterial Spot", crop: "Bell Pepper", disease: "Bacterial Spot", healthy: false, severity: "Moderate" },
  { classIndex: 5, code: "PEP-HLTY", name: "Bell Pepper - Healthy", crop: "Bell Pepper", disease: "Healthy", healthy: true, severity: "None" },
  { classIndex: 6, code: "CHR-HLTY", name: "Cherry - Healthy", crop: "Cherry", disease: "Healthy", healthy: true, severity: "None" },
  { classIndex: 7, code: "CHR-MILD", name: "Cherry - Powdery Mildew", crop: "Cherry", disease: "Powdery Mildew", healthy: false, severity: "Moderate" },
  { classIndex: 8, code: "CRN-CERC", name: "Corn (Maize) - Cercospora Leaf Spot", crop: "Corn (Maize)", disease: "Cercospora Leaf Spot", healthy: false, severity: "Moderate" },
  { classIndex: 9, code: "CRN-RUST", name: "Corn (Maize) - Common Rust", crop: "Corn (Maize)", disease: "Common Rust", healthy: false, severity: "Moderate" },
  { classIndex: 10, code: "CRN-HLTY", name: "Corn (Maize) - Healthy", crop: "Corn (Maize)", disease: "Healthy", healthy: true, severity: "None" },
  { classIndex: 11, code: "CRN-NLB", name: "Corn (Maize) - Northern Leaf Blight", crop: "Corn (Maize)", disease: "Northern Leaf Blight", healthy: false, severity: "High" },
  { classIndex: 12, code: "GRP-BLKR", name: "Grape - Black Rot", crop: "Grape", disease: "Black Rot", healthy: false, severity: "Moderate" },
  { classIndex: 13, code: "GRP-ESCA", name: "Grape - Esca (Black Measles)", crop: "Grape", disease: "Esca (Black Measles)", healthy: false, severity: "High" },
  { classIndex: 14, code: "GRP-HLTY", name: "Grape - Healthy", crop: "Grape", disease: "Healthy", healthy: true, severity: "None" },
  { classIndex: 15, code: "GRP-BLGT", name: "Grape - Leaf Blight", crop: "Grape", disease: "Leaf Blight", healthy: false, severity: "Moderate" },
  { classIndex: 16, code: "PCH-BACT", name: "Peach - Bacterial Spot", crop: "Peach", disease: "Bacterial Spot", healthy: false, severity: "Moderate" },
  { classIndex: 17, code: "PCH-HLTY", name: "Peach - Healthy", crop: "Peach", disease: "Healthy", healthy: true, severity: "None" },
  { classIndex: 18, code: "POT-EBLT", name: "Potato - Early Blight", crop: "Potato", disease: "Early Blight", healthy: false, severity: "Moderate" },
  { classIndex: 19, code: "POT-HLTY", name: "Potato - Healthy", crop: "Potato", disease: "Healthy", healthy: true, severity: "None" },
  { classIndex: 20, code: "POT-LBLT", name: "Potato - Late Blight", crop: "Potato", disease: "Late Blight", healthy: false, severity: "High" },
  { classIndex: 21, code: "STR-HLTY", name: "Strawberry - Healthy", crop: "Strawberry", disease: "Healthy", healthy: true, severity: "None" },
  { classIndex: 22, code: "STR-SCOR", name: "Strawberry - Leaf Scorch", crop: "Strawberry", disease: "Leaf Scorch", healthy: false, severity: "Moderate" },
  { classIndex: 23, code: "TOM-BACT", name: "Tomato - Bacterial Spot", crop: "Tomato", disease: "Bacterial Spot", healthy: false, severity: "Moderate" },
  { classIndex: 24, code: "TOM-EBLT", name: "Tomato - Early Blight", crop: "Tomato", disease: "Early Blight", healthy: false, severity: "Moderate" },
  { classIndex: 25, code: "TOM-HLTY", name: "Tomato - Healthy", crop: "Tomato", disease: "Healthy", healthy: true, severity: "None" },
  { classIndex: 26, code: "TOM-LBLT", name: "Tomato - Late Blight", crop: "Tomato", disease: "Late Blight", healthy: false, severity: "High" },
  { classIndex: 27, code: "TOM-SEPT", name: "Tomato - Septoria Leaf Spot", crop: "Tomato", disease: "Septoria Leaf Spot", healthy: false, severity: "Moderate" },
  { classIndex: 28, code: "TOM-YLCV", name: "Tomato - Yellow Leaf Curl Virus", crop: "Tomato", disease: "Yellow Leaf Curl Virus", healthy: false, severity: "High" },
];
const getDisease = (i) => DISEASES[Number(i)] || DISEASES[0];
const isHealthy = (d) => !!d && (d.healthy === true || /- Healthy$/.test(d.name || ""));
module.exports = { DISEASES, getDisease, isHealthy };
