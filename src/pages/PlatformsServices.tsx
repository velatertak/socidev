import React, { useState, useEffect } from 'react';
import {
    Plus,
    Edit,
    Trash2,
    Save,
    X,
    Package,
    Globe,
    DollarSign,
    Hash,
    Link,
    Star,
    Check,
    ChevronRight,
    ChevronDown,
    Percent
} from 'lucide-react';
import { PlatformConfig, ServiceConfig } from '../types';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

const PlatformsServices: React.FC = () => {
    // Platform states
    const [platforms, setPlatforms] = useState<PlatformConfig[]>([]);
    const [showPlatformModal, setShowPlatformModal] = useState(false);
    const [editingPlatform, setEditingPlatform] = useState<PlatformConfig | null>(null);
    const [newPlatform, setNewPlatform] = useState({
        name: '',
        description: '',
        icon: ''
    });
    const [expandedPlatformId, setExpandedPlatformId] = useState<string | null>(null);

    // Service states
    const [services, setServices] = useState<ServiceConfig[]>([]);
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [editingService, setEditingService] = useState<ServiceConfig | null>(null);
    const [selectedPlatformId, setSelectedPlatformId] = useState<string | null>(null);
    const [newService, setNewService] = useState({
        name: '',
        pricePerUnit: 0,
        minOrder: 0,
        maxOrder: 0,
        inputFieldName: '',
        sampleUrl: '',
        features: [''] as string[],
        commissionRate: 0
    });

    // Order simulation states
    const [showOrderForm, setShowOrderForm] = useState(false);
    const [orderForm, setOrderForm] = useState({
        platformId: '',
        serviceId: '',
        quantity: 1,
        targetUrl: ''
    });
    const [calculatedPrice, setCalculatedPrice] = useState(0);

    // Initialize with mock data
    useEffect(() => {
        const mockPlatforms: PlatformConfig[] = [
            {
                id: '1',
                name: 'Instagram',
                description: 'Social media platform for sharing photos and videos',
                icon: 'instagram',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: '2',
                name: 'YouTube',
                description: 'Video sharing platform',
                icon: 'youtube',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: '3',
                name: 'TikTok',
                description: 'Short-form video platform',
                icon: 'tiktok',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];

        const mockServices: ServiceConfig[] = [
            {
                id: '1',
                platformId: '1',
                name: 'Instagram Likes',
                pricePerUnit: 0.02,
                minOrder: 10,
                maxOrder: 10000,
                inputFieldName: 'postUrl',
                sampleUrl: 'https://instagram.com/p/ABC123/',
                features: ['Real likes', 'Instant start', 'No password required'],
                commissionRate: 10, // 10% commission
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: '2',
                platformId: '1',
                name: 'Instagram Followers',
                pricePerUnit: 0.05,
                minOrder: 50,
                maxOrder: 5000,
                inputFieldName: 'profileUrl',
                sampleUrl: 'https://instagram.com/username',
                features: ['Real followers', 'Fast delivery', 'No drop guarantee'],
                commissionRate: 15, // 15% commission
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: '3',
                platformId: '2',
                name: 'YouTube Views',
                pricePerUnit: 0.01,
                minOrder: 100,
                maxOrder: 100000,
                inputFieldName: 'videoUrl',
                sampleUrl: 'https://youtube.com/watch?v=ABC123',
                features: ['High retention', 'Real views', 'SEO friendly'],
                commissionRate: 8, // 8% commission
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];

        setPlatforms(mockPlatforms);
        setServices(mockServices);

        // Expand the first platform by default
        if (mockPlatforms.length > 0) {
            setExpandedPlatformId(mockPlatforms[0].id);
        }
    }, []);

    // Platform functions
    const handleAddPlatform = () => {
        if (!newPlatform.name) return;

        const platform: PlatformConfig = {
            id: Date.now().toString(),
            ...newPlatform,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        setPlatforms([...platforms, platform]);
        setNewPlatform({ name: '', description: '', icon: '' });
        setShowPlatformModal(false);
    };

    const handleUpdatePlatform = () => {
        if (!editingPlatform || !editingPlatform.name) return;

        setPlatforms(platforms.map(p =>
            p.id === editingPlatform.id
                ? { ...editingPlatform, updatedAt: new Date().toISOString() }
                : p
        ));
        setEditingPlatform(null);
        setShowPlatformModal(false);
    };

    const handleDeletePlatform = (id: string) => {
        if (!window.confirm('Are you sure you want to delete this platform?')) return;

        setPlatforms(platforms.filter(p => p.id !== id));
        // Also delete associated services
        setServices(services.filter(s => s.platformId !== id));

        // If the deleted platform was expanded, collapse it
        if (expandedPlatformId === id) {
            setExpandedPlatformId(null);
        }
    };

    // Toggle platform expansion
    const togglePlatform = (platformId: string) => {
        setExpandedPlatformId(expandedPlatformId === platformId ? null : platformId);
    };

    // Service functions
    const handleAddService = () => {
        if (!selectedPlatformId || !newService.name) return;

        const service: ServiceConfig = {
            id: Date.now().toString(),
            platformId: selectedPlatformId,
            ...newService,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        setServices([...services, service]);
        setNewService({
            name: '',
            pricePerUnit: 0,
            minOrder: 0,
            maxOrder: 0,
            inputFieldName: '',
            sampleUrl: '',
            features: [''],
            commissionRate: 0
        });
        setSelectedPlatformId(null);
        setShowServiceModal(false);
    };

    const handleUpdateService = () => {
        if (!editingService || !editingService.name) return;

        setServices(services.map(s =>
            s.id === editingService.id
                ? { ...editingService, updatedAt: new Date().toISOString() }
                : s
        ));
        setEditingService(null);
        setShowServiceModal(false);
    };

    const handleDeleteService = (id: string) => {
        if (!window.confirm('Are you sure you want to delete this service?')) return;

        setServices(services.filter(s => s.id !== id));
    };

    // Feature management
    const addFeature = (isEditing = false) => {
        if (isEditing && editingService) {
            setEditingService({
                ...editingService,
                features: [...editingService.features, '']
            });
        } else {
            setNewService({
                ...newService,
                features: [...newService.features, '']
            });
        }
    };

    const updateFeature = (index: number, value: string, isEditing = false) => {
        if (isEditing && editingService) {
            const updatedFeatures = [...editingService.features];
            updatedFeatures[index] = value;
            setEditingService({
                ...editingService,
                features: updatedFeatures
            });
        } else {
            const updatedFeatures = [...newService.features];
            updatedFeatures[index] = value;
            setNewService({
                ...newService,
                features: updatedFeatures
            });
        }
    };

    const removeFeature = (index: number, isEditing = false) => {
        if (isEditing && editingService) {
            const updatedFeatures = [...editingService.features];
            updatedFeatures.splice(index, 1);
            setEditingService({
                ...editingService,
                features: updatedFeatures
            });
        } else {
            const updatedFeatures = [...newService.features];
            updatedFeatures.splice(index, 1);
            setNewService({
                ...newService,
                features: updatedFeatures
            });
        }
    };

    // Order simulation functions
    const handlePlatformChange = (platformId: string) => {
        setOrderForm({
            ...orderForm,
            platformId,
            serviceId: ''
        });
    };

    const handleServiceChange = (serviceId: string) => {
        setOrderForm({
            ...orderForm,
            serviceId
        });

        // Calculate price
        const service = services.find(s => s.id === serviceId);
        if (service) {
            setCalculatedPrice(service.pricePerUnit * orderForm.quantity);
        }
    };

    const handleQuantityChange = (quantity: number) => {
        setOrderForm({
            ...orderForm,
            quantity
        });

        // Calculate price
        const service = services.find(s => s.id === orderForm.serviceId);
        if (service) {
            setCalculatedPrice(service.pricePerUnit * quantity);
        }
    };

    const handleSubmitOrder = () => {
        alert(`Order submitted!\nPlatform: ${platforms.find(p => p.id === orderForm.platformId)?.name}\nService: ${services.find(s => s.id === orderForm.serviceId)?.name}\nQuantity: ${orderForm.quantity}\nTotal: $${calculatedPrice.toFixed(2)}`);
        setShowOrderForm(false);
        setOrderForm({
            platformId: '',
            serviceId: '',
            quantity: 1,
            targetUrl: ''
        });
        setCalculatedPrice(0);
    };

    // Get services for selected platform
    const getServicesForPlatform = (platformId: string) => {
        return services.filter(service => service.platformId === platformId);
    };

    return (
        <div className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Platforms & Services Management</h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage social media platforms and their services</p>
                </div>
                <div className="flex space-x-3">
                    <Button onClick={() => setShowOrderForm(true)}>
                        <Package className="h-4 w-4 mr-2" />
                        Test Order Form
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Platforms Tree View */}
                <div className="bg-white shadow border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
                    <div className="px-4 py-5 sm:px-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Platforms & Services</h2>
                            <Button onClick={() => {
                                setEditingPlatform(null);
                                setNewPlatform({ name: '', description: '', icon: '' });
                                setShowPlatformModal(true);
                            }}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Platform
                            </Button>
                        </div>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700">
                        {platforms.length === 0 ? (
                            <div className="px-4 py-6 text-center">
                                <p className="text-gray-500 dark:text-gray-400">No platforms found. Add a platform to get started.</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                {platforms.map((platform) => {
                                    const platformServices = getServicesForPlatform(platform.id);
                                    const isExpanded = expandedPlatformId === platform.id;

                                    return (
                                        <li key={platform.id}>
                                            {/* Platform Item */}
                                            <div
                                                className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex items-center justify-between"
                                                onClick={() => togglePlatform(platform.id)}
                                            >
                                                <div className="flex items-center">
                                                    <button className="mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                                                        {isExpanded ? (
                                                            <ChevronDown className="h-5 w-5" />
                                                        ) : (
                                                            <ChevronRight className="h-5 w-5" />
                                                        )}
                                                    </button>
                                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center dark:bg-blue-900">
                                                        <Globe className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">{platform.name}</h3>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">{platform.description}</p>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingPlatform(platform);
                                                            setNewPlatform({
                                                                name: platform.name,
                                                                description: platform.description,
                                                                icon: platform.icon || ''
                                                            });
                                                            setShowPlatformModal(true);
                                                        }}
                                                        className="p-1 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeletePlatform(platform.id);
                                                        }}
                                                        className="p-1 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedPlatformId(platform.id);
                                                            setEditingService(null);
                                                            setNewService({
                                                                name: '',
                                                                pricePerUnit: 0,
                                                                minOrder: 0,
                                                                maxOrder: 0,
                                                                inputFieldName: '',
                                                                sampleUrl: '',
                                                                features: [''],
                                                                commissionRate: 0
                                                            });
                                                            setShowServiceModal(true);
                                                        }}
                                                        className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                                                    >
                                                        Add Service
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Services for this platform (only shown when expanded) */}
                                            {isExpanded && (
                                                <div className="bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                                                    {platformServices.length === 0 ? (
                                                        <div className="px-12 py-4">
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">No services for this platform</p>
                                                        </div>
                                                    ) : (
                                                        <ul className="divide-y divide-gray-200 dark:divide-gray-600">
                                                            {platformServices.map((service) => (
                                                                <li key={service.id} className="px-12 py-4">
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex-1 min-w-0">
                                                                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">{service.name}</h3>
                                                                            <div className="mt-1 flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400">
                                                                                <div className="flex items-center mr-4">
                                                                                    <DollarSign className="h-4 w-4 mr-1" />
                                                                                    <span>${service.pricePerUnit.toFixed(3)} per unit</span>
                                                                                </div>
                                                                                <div className="flex items-center mr-4">
                                                                                    <Hash className="h-4 w-4 mr-1" />
                                                                                    <span>{service.minOrder} - {service.maxOrder}</span>
                                                                                </div>
                                                                                {service.commissionRate !== undefined && service.commissionRate > 0 && (
                                                                                    <div className="flex items-center">
                                                                                        <Percent className="h-4 w-4 mr-1" />
                                                                                        <span>{service.commissionRate}% commission</span>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            <div className="mt-2 flex flex-wrap gap-1">
                                                                                {service.features.map((feature, index) => (
                                                                                    <span
                                                                                        key={index}
                                                                                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                                                    >
                                                                                        <Check className="h-3 w-3 mr-1" />
                                                                                        {feature}
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex space-x-2 ml-4">
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setEditingService(service);
                                                                                    setNewService({
                                                                                        name: service.name,
                                                                                        pricePerUnit: service.pricePerUnit,
                                                                                        minOrder: service.minOrder,
                                                                                        maxOrder: service.maxOrder,
                                                                                        inputFieldName: service.inputFieldName,
                                                                                        sampleUrl: service.sampleUrl,
                                                                                        features: [...service.features],
                                                                                        commissionRate: service.commissionRate || 0
                                                                                    });
                                                                                    setShowServiceModal(true);
                                                                                }}
                                                                                className="p-1 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                                            >
                                                                                <Edit className="h-4 w-4" />
                                                                            </button>
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleDeleteService(service.id);
                                                                                }}
                                                                                className="p-1 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {/* Platform Modal */}
            <Modal
                isOpen={showPlatformModal}
                onClose={() => {
                    setShowPlatformModal(false);
                    setEditingPlatform(null);
                }}
                title={editingPlatform ? "Edit Platform" : "Add Platform"}
                size="md"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Platform Name
                        </label>
                        <input
                            type="text"
                            value={editingPlatform ? editingPlatform.name : newPlatform.name}
                            onChange={(e) =>
                                editingPlatform
                                    ? setEditingPlatform({ ...editingPlatform, name: e.target.value })
                                    : setNewPlatform({ ...newPlatform, name: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="e.g., Instagram"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description
                        </label>
                        <textarea
                            value={editingPlatform ? editingPlatform.description : newPlatform.description}
                            onChange={(e) =>
                                editingPlatform
                                    ? setEditingPlatform({ ...editingPlatform, description: e.target.value })
                                    : setNewPlatform({ ...newPlatform, description: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Platform description"
                            rows={3}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Icon (Optional)
                        </label>
                        <input
                            type="text"
                            value={editingPlatform ? (editingPlatform.icon || '') : newPlatform.icon}
                            onChange={(e) =>
                                editingPlatform
                                    ? setEditingPlatform({ ...editingPlatform, icon: e.target.value })
                                    : setNewPlatform({ ...newPlatform, icon: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="e.g., instagram"
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowPlatformModal(false);
                                setEditingPlatform(null);
                            }}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                        <Button
                            onClick={editingPlatform ? handleUpdatePlatform : handleAddPlatform}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {editingPlatform ? "Update" : "Add"} Platform
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Service Modal */}
            <Modal
                isOpen={showServiceModal}
                onClose={() => {
                    setShowServiceModal(false);
                    setEditingService(null);
                    setSelectedPlatformId(null);
                }}
                title={editingService ? "Edit Service" : "Add Service"}
                size="lg"
            >
                <div className="space-y-4">
                    {!editingService && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Platform
                            </label>
                            <select
                                value={selectedPlatformId || ''}
                                onChange={(e) => setSelectedPlatformId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                required
                            >
                                <option value="">Select a platform</option>
                                {platforms.map((platform) => (
                                    <option key={platform.id} value={platform.id}>
                                        {platform.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Service Name
                        </label>
                        <input
                            type="text"
                            value={editingService ? editingService.name : newService.name}
                            onChange={(e) =>
                                editingService
                                    ? setEditingService({ ...editingService, name: e.target.value })
                                    : setNewService({ ...newService, name: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="e.g., Instagram Likes"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Price per Unit ($)
                            </label>
                            <input
                                type="number"
                                step="0.001"
                                min="0"
                                value={editingService ? editingService.pricePerUnit : newService.pricePerUnit}
                                onChange={(e) =>
                                    editingService
                                        ? setEditingService({ ...editingService, pricePerUnit: parseFloat(e.target.value) })
                                        : setNewService({ ...newService, pricePerUnit: parseFloat(e.target.value) })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Min Order
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={editingService ? editingService.minOrder : newService.minOrder}
                                onChange={(e) =>
                                    editingService
                                        ? setEditingService({ ...editingService, minOrder: parseInt(e.target.value) })
                                        : setNewService({ ...newService, minOrder: parseInt(e.target.value) })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Max Order
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={editingService ? editingService.maxOrder : newService.maxOrder}
                                onChange={(e) =>
                                    editingService
                                        ? setEditingService({ ...editingService, maxOrder: parseInt(e.target.value) })
                                        : setNewService({ ...newService, maxOrder: parseInt(e.target.value) })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Commission Rate (%)
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={editingService ? (editingService.commissionRate || 0) : newService.commissionRate}
                                onChange={(e) =>
                                    editingService
                                        ? setEditingService({ ...editingService, commissionRate: parseFloat(e.target.value) })
                                        : setNewService({ ...newService, commissionRate: parseFloat(e.target.value) })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Input Field Name
                        </label>
                        <input
                            type="text"
                            value={editingService ? editingService.inputFieldName : newService.inputFieldName}
                            onChange={(e) =>
                                editingService
                                    ? setEditingService({ ...editingService, inputFieldName: e.target.value })
                                    : setNewService({ ...newService, inputFieldName: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="e.g., postUrl"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Sample URL
                        </label>
                        <input
                            type="text"
                            value={editingService ? editingService.sampleUrl : newService.sampleUrl}
                            onChange={(e) =>
                                editingService
                                    ? setEditingService({ ...editingService, sampleUrl: e.target.value })
                                    : setNewService({ ...newService, sampleUrl: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="e.g., https://instagram.com/p/ABC123/"
                            required
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Features
                            </label>
                            <Button
                                size="sm"
                                onClick={() => addFeature(!!editingService)}
                            >
                                <Plus className="h-3 w-3 mr-1" />
                                Add Feature
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {(editingService ? editingService.features : newService.features).map((feature, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        value={feature}
                                        onChange={(e) => updateFeature(index, e.target.value, !!editingService)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="e.g., Real likes, Instant start"
                                    />
                                    <button
                                        onClick={() => removeFeature(index, !!editingService)}
                                        className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowServiceModal(false);
                                setEditingService(null);
                                setSelectedPlatformId(null);
                            }}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                        <Button
                            onClick={editingService ? handleUpdateService : handleAddService}
                            disabled={!selectedPlatformId && !editingService}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {editingService ? "Update" : "Add"} Service
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Order Simulation Form */}
            <Modal
                isOpen={showOrderForm}
                onClose={() => {
                    setShowOrderForm(false);
                    setOrderForm({
                        platformId: '',
                        serviceId: '',
                        quantity: 1,
                        targetUrl: ''
                    });
                    setCalculatedPrice(0);
                }}
                title="Order Simulation Form"
                size="md"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Select Platform
                        </label>
                        <select
                            value={orderForm.platformId}
                            onChange={(e) => handlePlatformChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                        >
                            <option value="">Select a platform</option>
                            {platforms.map((platform) => (
                                <option key={platform.id} value={platform.id}>
                                    {platform.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Select Service
                        </label>
                        <select
                            value={orderForm.serviceId}
                            onChange={(e) => handleServiceChange(e.target.value)}
                            disabled={!orderForm.platformId}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                            required
                        >
                            <option value="">Select a service</option>
                            {getServicesForPlatform(orderForm.platformId).map((service) => (
                                <option key={service.id} value={service.id}>
                                    {service.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Quantity
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={orderForm.quantity}
                            onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                        />
                    </div>

                    {orderForm.serviceId && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {services.find(s => s.id === orderForm.serviceId)?.inputFieldName || 'Target URL'}
                            </label>
                            <input
                                type="text"
                                value={orderForm.targetUrl}
                                onChange={(e) => setOrderForm({ ...orderForm, targetUrl: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder={services.find(s => s.id === orderForm.serviceId)?.sampleUrl || 'Enter URL'}
                                required
                            />
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Example: {services.find(s => s.id === orderForm.serviceId)?.sampleUrl || 'https://example.com'}
                            </p>
                        </div>
                    )}

                    {orderForm.serviceId && (
                        <div className="bg-blue-50 p-4 rounded-lg dark:bg-blue-900/20">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Total Price:</span>
                                <span className="text-lg font-bold text-blue-900 dark:text-blue-100">
                                    ${calculatedPrice.toFixed(2)}
                                </span>
                            </div>
                            {services.find(s => s.id === orderForm.serviceId)?.commissionRate && (
                                <div className="mt-2 flex justify-between items-center text-sm">
                                    <span className="text-blue-700 dark:text-blue-300">Commission ({services.find(s => s.id === orderForm.serviceId)?.commissionRate}%):</span>
                                    <span className="font-medium text-blue-800 dark:text-blue-200">
                                        ${(calculatedPrice * (services.find(s => s.id === orderForm.serviceId)?.commissionRate || 0) / 100).toFixed(2)}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowOrderForm(false);
                                setOrderForm({
                                    platformId: '',
                                    serviceId: '',
                                    quantity: 1,
                                    targetUrl: ''
                                });
                                setCalculatedPrice(0);
                            }}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmitOrder}
                            disabled={!orderForm.platformId || !orderForm.serviceId || !orderForm.targetUrl}
                        >
                            <Package className="h-4 w-4 mr-2" />
                            Submit Order
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default PlatformsServices;