import Link from "next/link";

interface Props {
  id: string;
  title: string;
  description: string;
  duration: number;
  progress?: number;
  started?: boolean; // add this flag
}

const startPlan = async (id: string) => {
  try {
    const response = await fetch(`/api/plans/${id}/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      location.reload();
    } else {
      console.error("Failed to mark as read");
    }
  } catch (error) {
    console.error("Error marking as read:", error);
  }
};
export default function PlanCard({
  id,
  title,
  description,
  duration,
  progress,
  started = true,
}: Props) {
  return (
    <Link
      className="border rounded-lg p-4 flex flex-col justify-between hover:bg-muted transition"
      href={`/plans/${id}/progress`}
    >
      {/* Title & Description */}
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>

        <div className="mt-2 text-xs text-muted-foreground">
          Duration: {duration} days
        </div>

        {/* Progress Bar (for my-plans page) */}
        {progress !== undefined && (
          <div className="mt-3 w-full bg-gray-200 h-2 rounded-full">
            <div
              className="bg-blue-600 h-full rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
      </div>

      {/* ACTION BUTTON */}
      <div className="mt-4">
        {started ? (
          /* Already started → Show gray disabled button */
          <button
            disabled
            className="w-full py-2 text-sm rounded-md bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-not-allowed"
          >
            Started
          </button>
        ) : (
          /* Not started → Show start button */
          <button
            onClick={() => startPlan(id)}
            className="w-full block text-center py-2 text-sm rounded-md bg-blue-600 hover:bg-blue-700 text-white transition"
          >
            Start Plan
          </button>
        )}
      </div>
    </Link>
  );
}
