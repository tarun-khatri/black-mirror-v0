import { Company } from '../types/index';
import { CompetitorData } from '../types/index';
import { fetchTwitterMetrics } from './twitterApi';
import { fetchLinkedInData } from './linkedInApi';
import { fetchMediumMetrics } from './mediumApi';
import { fetchOnchainMetrics } from './onchainApi';

export async function fetchAllCompetitorData(company: Company): Promise<CompetitorData> {
  if (!company) {
    console.log('No company provided to fetchAllCompetitorData');
    return { twitter: null, linkedIn: null, medium: null, onchainData: null, cryptoData: null, github: null };
  }

  console.log(`--- Fetching all data for ${company.name} ---`);
  console.log('Company identifiers:', company.identifiers);

  const twitterPromise = company.identifiers?.twitter 
    ? fetchTwitterMetrics(company.identifiers.twitter)
    : Promise.resolve(null);
    
  const linkedInPromise = company.identifiers?.linkedin 
    ? fetchLinkedInData(company.identifiers.linkedin, company.name)
    : Promise.resolve(null);
    
  const mediumPromise = company.identifiers?.medium 
    ? fetchMediumMetrics(company.identifiers.medium)
    : Promise.resolve(null);

  const onchainId = company.identifiers?.defillama || company.onchainAddress;
  console.log('Onchain ID being used:', onchainId);
  const onchainPromise = onchainId
    ? fetchOnchainMetrics(onchainId)
    : Promise.resolve(null);

  // For now, we'll return null for GitHub data
  const githubPromise = Promise.resolve(null);

  try {
    console.log('Waiting for all API calls to complete...');
    const [twitterResult, linkedInResult, mediumResult, onchainResult, githubResult] = await Promise.all([
      twitterPromise,
      linkedInPromise,
      mediumPromise,
      onchainPromise,
      githubPromise,
    ]);

    console.log('API results:');
    console.log('- Twitter:', twitterResult ? 'Data received' : 'No data');
    console.log('- LinkedIn:', linkedInResult ? 'Data received' : 'No data');
    console.log('- Medium:', mediumResult ? 'Data received' : 'No data');
    console.log('- Onchain:', onchainResult ? 'Data received' : 'No data');
    console.log('- Onchain data details:', onchainResult);
    console.log('- GitHub:', githubResult ? 'Data received' : 'No data');

    console.log(`--- Finished fetching for ${company.name} ---`);
    const result = {
      twitter: twitterResult,
      linkedIn: linkedInResult,
      medium: mediumResult,
      onchainData: onchainResult,
      cryptoData: null,
      github: githubResult,
    };
    
    console.log('Returning competitor data:', result);
    console.log('Onchain data in result:', result.onchainData);
    return result;
  } catch (error) {
    console.error("Error in fetchAllCompetitorData:", error);
    return { 
      twitter: null, 
      linkedIn: null, 
      medium: null, 
      onchainData: null,
      cryptoData: null,
      github: null
    };
  }
}

export const fetchOnchainData = async (company: Company) => {
  try {
    if (!company.identifiers?.defillama) {
      throw new Error('No DeFi Llama identifier found for this company');
    }

    const response = await fetch(`/api/cache/${company.name}/onchain/${company.identifiers.defillama}`);
    if (!response.ok) {
      throw new Error('Failed to fetch onchain data');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching onchain data:', error);
    throw error;
  }
};