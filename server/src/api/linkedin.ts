import express from 'express';
import dotenv from 'dotenv';
import { Request, Response } from 'express';

dotenv.config();

const router = express.Router();

interface LinkedInCompanyResponse {
    name: string;
    description: string;
    industry: string;
    website: string;
    staffCountRange: {
        start: number;
        end: number;
    };
}

// LinkedIn API configuration
const LINKEDIN_API_KEY = process.env.LINKEDIN_API_KEY;
const LINKEDIN_API_URL = 'https://api.linkedin.com/v2';

// Fetch company data from LinkedIn
router.get('/:identifier/:companyName', async (req: Request, res: Response) => {
    try {
        const { identifier, companyName } = req.params;
        
        // Construct the LinkedIn API URL
        const apiUrl = `${LINKEDIN_API_URL}/organizations/${identifier}`;
        
        // Make request to LinkedIn API
        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': `Bearer ${LINKEDIN_API_KEY}`,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`LinkedIn API error: ${response.statusText}`);
        }

        const data = await response.json() as LinkedInCompanyResponse;
        
        // Transform the data as needed
        const transformedData = {
            companyName,
            identifier,
            data: {
                name: data.name,
                description: data.description,
                industry: data.industry,
                website: data.website,
                employeeCount: data.staffCountRange,
            },
            timestamp: Date.now()
        };

        res.json(transformedData);
    } catch (error: unknown) {
        console.error('Error fetching LinkedIn data:', error);
        res.status(500).json({ 
            error: 'Failed to fetch LinkedIn data',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default router; 