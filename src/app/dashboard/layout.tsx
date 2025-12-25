import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { prisma } from '@/lib/prisma';
import type { SchoolConfig } from '@prisma/client';

async function getSchoolConfigLite() {
  const config = await prisma.schoolConfig.findFirst({
    select: {
      schoolName: true,
      schoolType: true,
      academicYear: true,
      offersNursery: true,
      offersPrimary: true,
      offersSecondary: true,
    },
  });
  return config;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schoolConfig = await getSchoolConfigLite();

  return (
    <MainLayout schoolConfig={schoolConfig as SchoolConfig | null}>
      <ProtectedRoute>
        {children}
      </ProtectedRoute>
    </MainLayout>
  );
}
