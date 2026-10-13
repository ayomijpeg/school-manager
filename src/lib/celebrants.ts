import { prisma } from '@/lib/prisma';
import { format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import type { BirthdayCelebrant } from '@/components/dashboard/BirthdayWidget';

export async function getCelebrantsThisWeek(): Promise<BirthdayCelebrant[]> {
  try {
    const studentsWithDob = await prisma.student.findMany({
      where: {
        deletedAt: null,
        dateOfBirth: { not: null },
      },
      select: {
        id: true,
        fullName: true,
        dateOfBirth: true,
        level: { select: { name: true } },
      },
      take: 200,
    });

    const now = new Date();
    const currentYear = now.getFullYear();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });     // Sunday

    const celebrants: BirthdayCelebrant[] = [];

    for (const s of studentsWithDob) {
      if (!s.dateOfBirth) continue;
      const dob = new Date(s.dateOfBirth);
      
      // Construct this year's birthday for the student
      const thisYearBirthday = new Date(currentYear, dob.getMonth(), dob.getDate());

      // Check if it falls within the current week interval
      if (isWithinInterval(thisYearBirthday, { start: weekStart, end: weekEnd })) {
        const isToday =
          dob.getDate() === now.getDate() && dob.getMonth() === now.getMonth();

        celebrants.push({
          id: s.id,
          fullName: s.fullName,
          className: s.level?.name || null,
          dateOfBirth: s.dateOfBirth,
          isToday,
          formattedDate: format(thisYearBirthday, 'EEEE, MMM d'),
        });
      }
    }

    // Sort: isToday first, then by date
    celebrants.sort((a, b) => {
      if (a.isToday) return -1;
      if (b.isToday) return 1;
      return new Date(a.dateOfBirth).getDate() - new Date(b.dateOfBirth).getDate();
    });

    return celebrants.slice(0, 8); // Top 8 celebrants
  } catch (error) {
    console.error('Error fetching celebrants:', error);
    return [];
  }
}
