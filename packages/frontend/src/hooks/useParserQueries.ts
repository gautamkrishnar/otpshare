import { useQuery } from '@tanstack/react-query';
import { parserAPI } from '../services/api';

export const useParserMetadata = () => {
  return useQuery({
    queryKey: ['parser-metadata'],
    queryFn: parserAPI.getMetadata,
    staleTime: 5 * 60 * 1000, // 5 minutes - parser metadata doesn't change often
  });
};
