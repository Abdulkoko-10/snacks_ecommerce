import React from 'react';
import { ChatRecommendationCard } from '@fd/schemas/chat';
import Link from 'next/link';
import Image from 'next/image';

interface ChatRecommendationCardProps {
  card: ChatRecommendationCard;
}

const ChatRecommendationCardComponent = ({ card }: ChatRecommendationCardProps) => {
  return (
    <Link href={`/product/${card.canonicalProductId}`} passHref>
      <div className="recommendation-card">
        <Image src={card.preview.image} alt={card.preview.title} width={80} height={80} />
        <div className="recommendation-card-details">
          <h3>{card.preview.title}</h3>
          <p>{card.reason}</p>
          <div className="recommendation-card-footer">
            <span>{card.preview.rating} ★</span>
            <span>{card.preview.minPrice}</span>
            <span>{card.preview.eta}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ChatRecommendationCardComponent;
