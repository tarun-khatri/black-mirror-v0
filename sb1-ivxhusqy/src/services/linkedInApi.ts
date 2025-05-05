import { SocialMediaData, LinkedInCompanyData } from '../types/index';
import { fetchSocialMediaDataWithCache } from './socialMediaApi';

function mapMongoLinkedInData(mongoData: any) {
  if (!mongoData) return null;
  return {
    name: mongoData.companyName,
    profileImage: mongoData.logo,
    industry: Array.isArray(mongoData.industry) ? mongoData.industry.join(', ') : mongoData.industry,
    description: mongoData.description,
    website: mongoData.website,
    followers: mongoData.followerCount,
    staffCount: mongoData.staffCount,
    staffCountRange: mongoData.staffCountRange,
    linkedinUrl: mongoData.linkedinUrl,
    employeeDistribution: {
      byFunction: mongoData.employeeDistribution?.function,
      bySkill: mongoData.employeeDistribution?.skill,
      byLocation: mongoData.employeeDistribution?.location,
    },
    fundingData: mongoData.fundingData,
    growth: mongoData.growth,
    // Add more mappings as needed
  };
}

export async function fetchLinkedInData(identifier: string, companyName: string): Promise<any | null> {
  if (!identifier) {
    console.warn('No LinkedIn identifier provided');
    return null;
  }

  try {
    const data = await fetchSocialMediaDataWithCache('LinkedIn', identifier, companyName);
    if (!data) {
      console.warn('LinkedIn API returned no data');
      return null;
    }

    // If the data is in the MongoDB raw format, map it
    const mapped = mapMongoLinkedInData(data);
    return mapped || data;
  } catch (error) {
    console.error('Error fetching LinkedIn data:', error);
    return null;
  }
}

export async function fetchLinkedInCompanyData(companyName: string) {
  try {
    return await fetchLinkedInData("company", companyName);
  } catch (error) {
    console.error("Error fetching LinkedIn company data:", error);
    throw error;
  }
}

export async function fetchLinkedInProfileData(profileId: string) {
  try {
    return await fetchLinkedInData(profileId, "");
  } catch (error) {
    console.error("Error fetching LinkedIn profile data:", error);
    throw error;
  }
}