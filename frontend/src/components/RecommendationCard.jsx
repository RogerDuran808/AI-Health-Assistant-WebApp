// frontend/src/components/RecommendationCard.jsx
import PropTypes from "prop-types";
import { Card, CardContent } from "./ui/card";
import ReactMarkdown from "react-markdown";

export default function RecommendationCard({ text }) {
  if (!text) return null; // No contingut ⇒ no targeta

  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-white shadow-lg">
      <CardContent className="prose max-w-none p-6">
        <h2 className="text-2xl font-bold text-indigo-700 mb-4">
          Recomanació personalitzada
        </h2>
        <ReactMarkdown>{text}</ReactMarkdown>
      </CardContent>
    </Card>
  );
}

RecommendationCard.propTypes = {
  text: PropTypes.string,
};