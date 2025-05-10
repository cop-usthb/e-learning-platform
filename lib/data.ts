// Données statiques pour les cours
export const courses = [
  {
    _id: "1",
    id: 1,
    partner: "SkillUp EdTech",
    course: "IBM IT Project Manager",
    skills:
      "Software Engineering, Agile Software Development, Computer Programming, Software Engineering Tools, Application Development, Programming Principles, Software Architecture, Communication, Cloud Applications, Product Management, Scrum (Software Development), Software-Defined Networking, Leadership and Management, Project Management, Cloud Computing, IBM Cloud, Information Technology, Operating Systems, Python Programming, Risk Management",
    rating: "4.8",
    reviewcount: "2.4k",
    level: "Beginner",
    certificatetype: "Professional Certificate",
    duration: "3 - 6 Months",
    crediteligibility: "false",
  },
  {
    _id: "2",
    id: 2,
    partner: "Microsoft",
    course: "Azure Cloud Fundamentals",
    skills:
      "Cloud Computing, Azure, IT Infrastructure, DevOps, Networking, Security, Virtualization, Containers, Microservices, Serverless Computing, Cloud Storage, Cloud Security, Cloud Architecture, Cloud Deployment, Cloud Management, Cloud Monitoring, Cloud Optimization, Cloud Governance, Cloud Compliance, Cloud Migration",
    rating: "4.9",
    reviewcount: "3.5k",
    level: "Intermediate",
    certificatetype: "Professional Certificate",
    duration: "1 - 2 Months",
    crediteligibility: "true",
  },
  {
    _id: "3",
    id: 3,
    partner: "Google",
    course: "Data Science with Python",
    skills:
      "Python, Data Science, Machine Learning, Data Analysis, Data Visualization, Statistical Analysis, Pandas, NumPy, Matplotlib, Scikit-learn, Jupyter Notebooks, Data Cleaning, Feature Engineering, Model Evaluation, Regression, Classification, Clustering, Dimensionality Reduction, Natural Language Processing, Deep Learning",
    rating: "4.8",
    reviewcount: "2.8k",
    level: "Intermediate",
    certificatetype: "Certificate",
    duration: "2 - 3 Months",
    crediteligibility: "false",
  },
  {
    _id: "4",
    id: 4,
    partner: "Amazon Web Services",
    course: "AWS Solutions Architect",
    skills:
      "Cloud Computing, AWS, Cloud Architecture, Cloud Security, Cloud Storage, Cloud Networking, Cloud Databases, Cloud Deployment, Cloud Management, Cloud Monitoring, Cloud Optimization, Cloud Governance, Cloud Compliance, Cloud Migration, DevOps, Infrastructure as Code, Serverless Computing, Containers, Microservices, Disaster Recovery",
    rating: "4.7",
    reviewcount: "4.2k",
    level: "Advanced",
    certificatetype: "Professional Certificate",
    duration: "3 - 6 Months",
    crediteligibility: "true",
  },
  {
    _id: "5",
    id: 5,
    partner: "IBM",
    course: "Artificial Intelligence Fundamentals",
    skills:
      "Artificial Intelligence, Machine Learning, Deep Learning, Neural Networks, Natural Language Processing, Computer Vision, Reinforcement Learning, AI Ethics, Data Science, Python, TensorFlow, PyTorch, Keras, Data Analysis, Data Visualization, Statistical Analysis, Model Evaluation, Feature Engineering, AI Applications, AI Implementation",
    rating: "4.6",
    reviewcount: "1.9k",
    level: "Beginner",
    certificatetype: "Certificate",
    duration: "2 - 4 Months",
    crediteligibility: "false",
  },
  {
    _id: "6",
    id: 6,
    partner: "Meta",
    course: "React Developer",
    skills:
      "React, JavaScript, Web Development, Frontend Development, HTML, CSS, Redux, React Router, React Hooks, React Context, React Testing, React Native, Web APIs, Responsive Design, UI/UX, Component-Based Architecture, State Management, Single Page Applications, Progressive Web Apps, Version Control",
    rating: "4.7",
    reviewcount: "3.1k",
    level: "Intermediate",
    certificatetype: "Professional Certificate",
    duration: "2 - 4 Months",
    crediteligibility: "false",
  },
  {
    _id: "7",
    id: 7,
    partner: "SkillUp EdTech",
    course: "Full Stack Web Development",
    skills:
      "Web Development, JavaScript, HTML, CSS, Node.js, Express.js, MongoDB, React, Redux, REST APIs, GraphQL, Authentication, Authorization, Database Design, Server-Side Rendering, Client-Side Rendering, Responsive Design, UI/UX, Version Control, Deployment",
    rating: "4.8",
    reviewcount: "2.7k",
    level: "Intermediate",
    certificatetype: "Professional Certificate",
    duration: "4 - 6 Months",
    crediteligibility: "false",
  },
  {
    _id: "8",
    id: 8,
    partner: "Cisco",
    course: "Network Security Specialist",
    skills:
      "Network Security, Cybersecurity, Firewalls, VPNs, Intrusion Detection, Intrusion Prevention, Security Policies, Risk Management, Vulnerability Assessment, Penetration Testing, Encryption, Authentication, Authorization, Access Control, Security Auditing, Security Compliance, Security Monitoring, Security Incident Response, Security Tools, Security Best Practices",
    rating: "4.9",
    reviewcount: "1.8k",
    level: "Advanced",
    certificatetype: "Professional Certificate",
    duration: "3 - 5 Months",
    crediteligibility: "true",
  },
]

// Données statiques pour les utilisateurs
export const users = [
  {
    _id: "1",
    name: "John Doe",
    email: "john@example.com",
    password: "password123", // Dans une vraie application, ce serait un hash
    interests: ["programming", "web", "cloud"],
    purchasedCourses: [
      {
        courseId: 1,
        purchaseDate: new Date("2023-01-15"),
        progress: 75,
      },
      {
        courseId: 3,
        purchaseDate: new Date("2023-03-10"),
        progress: 30,
      },
    ],
  },
  {
    _id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    password: "password123",
    interests: ["data-science", "ai", "cloud"],
    purchasedCourses: [
      {
        courseId: 2,
        purchaseDate: new Date("2023-02-20"),
        progress: 50,
      },
      {
        courseId: 5,
        purchaseDate: new Date("2023-04-05"),
        progress: 20,
      },
    ],
  },
]

// Fonction pour générer un ID unique
export function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
