// "use client";
// import { DataGrid } from 'datarix';

// const columns = [
//     { id: 'id', label: 'ID', width: 80, frozen: true },
//     { id: 'name', label: 'Name', width: 200 },
//     { id: 'email', label: 'Email', width: 250 },
//     { id: 'phone', label: 'Phone', width: 150 },
//     { id: 'company', label: 'Company', width: 180 },
//     { id: 'status', label: 'Status', width: 150 },
//     { id: 'leadSource', label: 'Lead Source', width: 160 },
//     { id: 'industry', label: 'Industry', width: 150 },
//     { id: 'country', label: 'Country', width: 150 },
//     { id: 'dealValue', label: 'Deal Value', width: 150 },
//     { id: 'rating', label: 'Rating', width: 120 },
//     { id: 'lastContact', label: 'Last Contact', width: 150 },
//     { id: 'createdAt', label: 'Created At', width: 150 },
//     { id: 'updatedAt', label: 'Updated At', width: 150 }
// ];

// // interface Column {
// //   id: string;          // Unique identifier
// //   label: string;       // Display label
// //   width: number;       // Column width in pixels
// //   frozen?: boolean;    // Freeze column to left
// //   renderCell?: (value, column, row) => ReactNode;  // Custom renderer
// // }

// function generateCRMData(count = 50) {
//     const firstNames = ["John", "Priya", "Aditi", "Carlos", "Robert", "Neha", "Arjun", "Emily", "Jessica", "Karan", "Amit", "Sonia", "Riya", "David", "Ankit"];
//     const lastNames = ["Doe", "Sharma", "Verma", "Rodriguez", "Brown", "Patel", "Mehta", "Johnson", "Miller", "Thakur", "Singh", "Shetty", "Kapoor"];
//     const companies = ["TechGen", "Innovexa", "FalconCorp", "DigiStorm", "Alpha Ventures", "SkyLabs", "NextWave", "CodeSphere", "BrightPath", "Xenovate", "Orbit Labs"];
//     const leadSources = ["Website", "LinkedIn", "Google Ads", "Referral", "Cold Call", "Email Campaign", "Trade Show"];
//     const statusList = ["Lead", "Prospect", "Customer", "Follow-Up", "Lost"];
//     const industries = ["IT", "Finance", "Healthcare", "Retail", "Manufacturing", "Education", "Real Estate"];
//     const countries = ["India", "USA", "UK", "Canada", "Australia", "Germany", "Singapore"];

//     const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

//     const randomPhone = () => "+91 " + Math.floor(6000000000 + Math.random() * 3999999999);
//     const randomEmail = (name) => name.toLowerCase().replace(" ", ".") + "@example.com";

//     const randomDate = () => {
//         const start = new Date(2024, 0, 1);
//         const end = new Date();
//         return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
//             .toISOString()
//             .split("T")[0];
//     };

//     const data = [];

//     for (let i = 1; i <= count; i++) {
//         const fname = random(firstNames);
//         const lname = random(lastNames);
//         const fullName = `${fname} ${lname}`;

//         data.push({
//             id: i,
//             name: fullName,
//             email: randomEmail(fullName),
//             phone: randomPhone(),
//             company: random(companies),
//             status: random(statusList),
//             leadSource: random(leadSources),
//             industry: random(industries),
//             country: random(countries),
//             dealValue: Math.floor(Math.random() * 90000) + 5000,
//             rating: Math.floor(Math.random() * 5) + 1,
//             lastContact: randomDate(),
//             createdAt: randomDate(),
//             updatedAt: randomDate()
//         });
//     }

//     return data;
// }

// const data = generateCRMData(100);



// function Test() {
//     return (
//         <DataGrid
//             data={data}
//             columns={columns}
//             height="600px"
//         />
//     );
// }

// export default Test;

import Home1 from '@/components/home1'
import React from 'react'

const page = () => {
    return (
        <Home1 />
    )
}

export default page
