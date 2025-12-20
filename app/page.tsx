"use client";
import { HomeNavbar } from "@/components/HomeNavBar";
import { Button } from "@/components/Button";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { BookOpen, Users, BarChart3 } from "lucide-react";

export default function HomePage() {
  const t = useTranslations("common");
  return (
    <div className="min-h-screen bg-gray-50">
      <HomeNavbar />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            {t("appTitle")}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {t("landingSubtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/login">
              <Button size="lg" className="px-8 py-3 text-lg">
                {t("Login")}
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
                {t("Signup")}
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Track Your Reading
              </h3>
              <p className="text-gray-600">
                Keep track of your daily Bible reading progress and maintain
                your reading streak.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Community Chat
              </h3>
              <p className="text-gray-600">
                Connect with other believers and discuss your readings in our
                community chat.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Progress Analytics
              </h3>
              <p className="text-gray-600">
                View detailed analytics and insights about your reading habits
                and achievements.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
