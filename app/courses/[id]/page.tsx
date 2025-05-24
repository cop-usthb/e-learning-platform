import { CourseDetails } from "@/components/course-details"
import { CourseChapters } from "@/components/course-chapters"
import { CourseRating } from "@/components/course-rating" 
import { CourseActions } from "@/components/course-actions"
import { getCourseById } from "@/lib/courses"
import { getUserCourseStatus } from "@/lib/user"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function CoursePage({
  params
}: {
  params: { id: string }
}) {
  // First, resolve the params object
  const resolvedParams = await Promise.resolve(params);
  const courseId = String(resolvedParams.id);
  
  const session = await getServerSession(authOptions);
  const course = await getCourseById(courseId);

  if (!course) {
    redirect("/courses");
  }

  const userStatus = session?.user ? await getUserCourseStatus(session.user.id, courseId) : null;

  const isPurchased = userStatus?.purchased || false;
  const completedChapters = userStatus?.completedChapters || [];
  const userRating = userStatus?.rating;

  return (
    <div className="container mx-auto px-4 py-8">
      <CourseDetails course={course} userStatus={userStatus} />

      {session?.user ? (
        <>
          {isPurchased ? (
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <CourseChapters courseId={courseId} chapters={course.chapters} completedChapters={completedChapters} />
              </div>
              <div className="md:col-span-1">
                <CourseRating courseId={courseId} initialRating={userRating} />
                <CourseActions courseId={courseId} isPurchased={isPurchased} />
              </div>
            </div>
          ) : (
            <CourseActions courseId={courseId} isPurchased={isPurchased} />
          )}
        </>
      ) : (
        <div className="mt-8 p-4 bg-muted rounded-lg text-center">
          <p className="mb-2">Connectez-vous pour accéder à ce cours</p>
          <a href="/auth/signin" className="text-primary hover:underline">
            Se connecter
          </a>
        </div>
      )}
    </div>
  );
}
