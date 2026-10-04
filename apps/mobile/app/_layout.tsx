import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { initializeDatabase } from '../src/db/database';

export default function Layout() {
  useEffect(() => { void initializeDatabase(); }, []);
  return <Stack />;
}
