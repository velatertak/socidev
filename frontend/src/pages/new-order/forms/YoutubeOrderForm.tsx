import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useLanguage } from '../../../context/LanguageContext';
import {
  ThumbsUp,
  Eye,
  Users,
  Clock,
  AlertCircle,
  CheckCircle,
  Zap,
  Shield,
  Link2,
  DollarSign,
} from 'lucide-react';

interface Service {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  basePrice: number;
  minQuantity: number;
  maxQuantity: number;
  features: string[];
  urlExample?: string;
}

export const YoutubeOrderForm = () => {
  const { t } = useLanguage();
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [targetUrls, setTargetUrls] = useState<Record<string, string>>({});
  const [selectedSpeed, setSelectedSpeed] = useState<'normal' | 'fast' | 'express'>('normal');

  const services: Service[] = [
    {
      id: 'views',
      name: t('youtubeViews'),
      icon: Eye,
      description: t('youtubeViewsDescription'),
      basePrice: 0.01,
      minQuantity: 1000,
      maxQuantity: 100000,
      features: [
        t('highRetention'),
        t('fastDelivery'),
        t('worldwideViews'),
        t('support')
      ],
      urlExample: 'https://youtube.com/watch?v=example'
    },
    {
      id: 'subscribers',
      name: t('youtubeSubscribers'),
      icon: Users,
      description: t('youtubeSubscribersDescription'),
      basePrice: 0.05,
      minQuantity: 100,
      maxQuantity: 10000,
      features: [
        t('realSubscribers'),
        t('activeProfiles'),
        t('naturalGrowth'),
        t('noDrop')
      ],
      urlExample: 'https://youtube.com/channel/example'
    },
    {
      id: 'likes',
      name: t('youtubeLikes'),
      icon: ThumbsUp,
      description: t('youtubeLikesDescription'),
      basePrice: 0.02,
      minQuantity: 100,
      maxQuantity: 25000,
      features: [
        t('highQuality'),
        t('fastDelivery'),
        t('permanentLikes'),
        t('safeProcess')
      ],
      urlExample: 'https://youtube.com/watch?v=example'
    },
    {
      id: 'watchTime',
      name: t('youtubeWatchTime'),
      icon: Clock,
      description: t('youtubeWatchTimeDescription'),
      basePrice: 0.5,
      minQuantity: 10,
      maxQuantity: 4000,
      features: [
        t('realWatchTime'),
        t('boostRankings'),
        t('monetizationHelp'),
        t('analyticsFriendly')
      ],
      urlExample: 'https://youtube.com/watch?v=example'
    }
  ];

  const speeds = [
    {
      id: 'normal',
      name: t('normalSpeed'),
      description: t('normalSpeedDescription'),
      icon: Clock,
      price: 0,
    },
    {
      id: 'fast',
      name: t('fastSpeed'),
      description: t('fastSpeedDescription'),
      icon: Zap,
      price: 5,
    },
    {
      id: 'express',
      name: t('expressSpeed'),
      description: t('expressSpeedDescription'),
      icon: Zap,
      price: 10,
    }
  ] as const;

  const handleServiceToggle = (serviceId: string) => {
    const newSelected = new Set(selectedServices);
    if (newSelected.has(serviceId)) {
      newSelected.delete(serviceId);
      const newQuantities = { ...quantities };
      delete newQuantities[serviceId];
      setQuantities(newQuantities);
    } else {
      newSelected.add(serviceId);
      const service = services.find(s => s.id === serviceId);
      if (service) {
        setQuantities(prev => ({
          ...prev,
          [serviceId]: service.minQuantity
        }));
      }
    }
    setSelectedServices(newSelected);
  };

  const handleQuantityChange = (serviceId: string, value: number) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      if (value >= service.minQuantity && value <= service.maxQuantity) {
        setQuantities(prev => ({
          ...prev,
          [serviceId]: value
        }));
      }
    }
  };

  const calculatePrice = (): number => {
    let total = 0;
    selectedServices.forEach((serviceId) => {
      const service = services.find(s => s.id === serviceId);
      if (service) {
        const quantity = quantities[serviceId] || service.minQuantity;
        const discount = calculateDiscount(quantity);
        total += service.basePrice * quantity * (1 - discount);
      }
    });

    // Add speed cost
    const speedCost = selectedSpeed === 'express' ? 10 : selectedSpeed === 'fast' ? 5 : 0;
    total += speedCost;

    return total;
  };

  const calculateDiscount = (quantity: number): number => {
    if (quantity >= 50000) return 0.15;
    if (quantity >= 10000) return 0.10;
    if (quantity >= 5000) return 0.05;
    return 0;
  };

  const handleSubmit = () => {
    // Implement order submission
    console.log('Submitting order:', {
      services: Array.from(selectedServices),
      quantities,
      targetUrls,
      speed: selectedSpeed,
      totalPrice: calculatePrice()
    });
  };

  return (
    <div className="space-y-8">
      {/* Services */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">{t('selectServices')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => {
            const Icon = service.icon;
            const isSelected = selectedServices.has(service.id);
            const quantity = quantities[service.id] || service.minQuantity;
            const discount = calculateDiscount(quantity);
            const price = service.basePrice * quantity * (1 - discount);

            return (
              <div
                key={service.id}
                onClick={() => handleServiceToggle(service.id)}
                className={`relative p-6 rounded-xl border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-red-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${
                    isSelected ? 'bg-red-100' : 'bg-gray-100'
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      isSelected ? 'text-red-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{service.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                    <p className="text-sm font-medium text-gray-900 mt-2">
                      {t('startingFrom')} ₺{service.basePrice.toFixed(2)}/{t('each')}
                    </p>
                  </div>
                  {isSelected && (
                    <CheckCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>

                {isSelected && (
                  <div className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {t('quantity')}
                      </label>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => handleQuantityChange(service.id, parseInt(e.target.value))}
                        min={service.minQuantity}
                        max={service.maxQuantity}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-red-200"
                      />
                      <p className="text-xs text-gray-500">
                        {t('minQuantity')}: {service.minQuantity.toLocaleString()} • 
                        {t('maxQuantity')}: {service.maxQuantity.toLocaleString()}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {t('targetUrl')}
                      </label>
                      <div className="relative">
                        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="url"
                          value={targetUrls[service.id] || ''}
                          onChange={(e) => setTargetUrls(prev => ({
                            ...prev,
                            [service.id]: e.target.value
                          }))}
                          placeholder={service.urlExample}
                          className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-red-200"
                        />
                      </div>
                    </div>

                    {discount > 0 && (
                      <div className="flex items-center gap-2 text-green-600 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        {t('bulkDiscount', { discount: (discount * 100).toFixed(0) })}
                      </div>
                    )}

                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{t('total')}</span>
                        <span className="text-lg font-bold text-gray-900">₺{price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Delivery Speed */}
      {selectedServices.size > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('deliverySpeed')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {speeds.map(({ id, name, description, icon: Icon, price }) => (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedSpeed(id)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedSpeed === id
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-red-200'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${
                    selectedSpeed === id ? 'bg-red-100' : 'bg-gray-100'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      selectedSpeed === id ? 'text-red-600' : 'text-gray-500'
                    }`} />
                  </div>
                  <div>
                    <p className={`font-medium ${
                      selectedSpeed === id ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {name}
                    </p>
                    <p className="text-sm text-gray-500">{description}</p>
                  </div>
                </div>
                <div className="text-right">
                  {price > 0 ? (
                    <span className="text-sm font-medium text-gray-900">
                      +₺{price.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-sm font-medium text-green-600">{t('free')}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Order Summary */}
      {selectedServices.size > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{t('orderSummary')}</h3>
              <p className="text-sm text-gray-500">{t('reviewOrder')}</p>
            </div>
          </div>

          <div className="space-y-4">
            {Array.from(selectedServices).map(serviceId => {
              const service = services.find(s => s.id === serviceId);
              if (!service) return null;

              const quantity = quantities[serviceId] || service.minQuantity;
              const discount = calculateDiscount(quantity);
              const price = service.basePrice * quantity * (1 - discount);

              return (
                <div key={serviceId} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {service.name} ({quantity.toLocaleString()})
                  </span>
                  <span className="font-medium text-gray-900">₺{price.toFixed(2)}</span>
                </div>
              );
            })}

            {/* Speed Cost */}
            {selectedSpeed !== 'normal' && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {selectedSpeed === 'express' ? t('expressDelivery') : t('fastDelivery')}
                </span>
                <span className="font-medium text-gray-900">
                  ₺{selectedSpeed === 'express' ? '10.00' : '5.00'}
                </span>
              </div>
            )}

            {/* Total */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between">
                <span className="font-medium text-gray-900">{t('totalAmount')}</span>
                <span className="font-bold text-gray-900">₺{calculatePrice().toFixed(2)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white"
            >
              {t('placeOrder')}
            </Button>

            {/* Security Note */}
            <div className="flex items-start gap-2 text-sm text-gray-500">
              <Shield className="w-4 h-4 mt-0.5" />
              <p>{t('securityNote')}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};