import { Link } from "react-router-dom";

export default function DonationCancelPage() {
  return (
    <div className="min-h-screen bg-background-light py-12 px-4">
      <div className="max-w-md mx-auto text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-4xl text-gray-400">
            close
          </span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Donation Cancelled
        </h1>
        <p className="text-gray-600 mb-8">
          No worries! Your donation was not processed. You can try again whenever you're ready.
        </p>

        <div className="space-y-4">
          <Link
            to="/donate"
            className="block w-full py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all"
          >
            <span className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">favorite</span>
              Try Again
            </span>
          </Link>

          <Link
            to="/"
            className="block w-full py-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
          >
            Return to Gallery
          </Link>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-xl">
          <p className="text-sm text-blue-700">
            <span className="font-medium">Need help?</span> If you experienced any issues during checkout, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
}
