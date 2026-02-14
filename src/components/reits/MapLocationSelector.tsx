'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Popup, useMapEvents } from 'react-leaflet';
import { Search, MapPin, Navigation } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 修复 Leaflet 默认图标问题
const fixLeafletIcons = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
};

if (typeof window !== 'undefined') {
  fixLeafletIcons();
}

interface MapLocationSelectorProps {
  onLocationChange: (latitude: number, longitude: number, address: string) => void;
  initialLatitude?: number;
  initialLongitude?: number;
  radius?: number; // 分析半径（公里）
}

interface SearchSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
}

// 地图事件处理组件
function MapClickHandler({
  onClick,
  radius,
}: {
  onClick: (lat: number, lng: number) => void;
  radius: number;
}) {
  useMapEvents({
    click: (e) => {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
}

export default function MapLocationSelector({
  onLocationChange,
  initialLatitude = 39.9042,
  initialLongitude = 116.4074,
  radius = 2,
}: MapLocationSelectorProps) {
  const [position, setPosition] = useState<[number, number]>([initialLatitude, initialLongitude]);
  const [address, setAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  // 根据经纬度获取地址（反向地理编码）
  const getAddressFromCoordinates = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=zh-CN`
      );
      const data = await response.json();
      return data.display_name || '未知位置';
    } catch (error) {
      console.error('获取地址失败:', error);
      return `纬度: ${lat.toFixed(4)}, 经度: ${lng.toFixed(4)}`;
    }
  };

  // 搜索位置（模糊查询）
  const searchLocation = async (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=5&addressdetails=1&accept-language=zh-CN`
      );
      const data: SearchSuggestion[] = await response.json();
      setSearchSuggestions(data);
      setShowSuggestions(true);
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // 选择搜索建议
  const selectSuggestion = (suggestion: SearchSuggestion) => {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    setPosition([lat, lng]);
    setAddress(suggestion.display_name);
    setShowSuggestions(false);
    setSearchQuery(suggestion.display_name);

    // 移动地图到选中位置
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 13);
    }

    onLocationChange(lat, lng, suggestion.display_name);
  };

  // 处理地图点击
  const handleMapClick = async (lat: number, lng: number) => {
    setPosition([lat, lng]);
    const newAddress = await getAddressFromCoordinates(lat, lng);
    setAddress(newAddress);
    setSearchQuery(newAddress);
    onLocationChange(lat, lng, newAddress);
  };

  // 搜索输入防抖
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        searchLocation(searchQuery);
      } else {
        setSearchSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 初始化获取地址
  useEffect(() => {
    if (initialLatitude && initialLongitude) {
      getAddressFromCoordinates(initialLatitude, initialLongitude).then((addr) => {
        setAddress(addr);
        setSearchQuery(addr);
        onLocationChange(initialLatitude, initialLongitude, addr);
      });
    }
  }, []);

  // 定位到当前位置
  const locateCurrentPosition = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setPosition([latitude, longitude]);
          const newAddress = await getAddressFromCoordinates(latitude, longitude);
          setAddress(newAddress);
          setSearchQuery(newAddress);

          if (mapRef.current) {
            mapRef.current.setView([latitude, longitude], 13);
          }

          onLocationChange(latitude, longitude, newAddress);
        },
        (error) => {
          console.error('获取当前位置失败:', error);
          alert('无法获取当前位置，请确保已授予位置权限');
        }
      );
    } else {
      alert('您的浏览器不支持地理定位');
    }
  };

  return (
    <div className="space-y-4">
      {/* 搜索框 */}
      <div className="relative">
        <div className="relative flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索地址（如：北京市朝阳区国贸）"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#667eea] dark:bg-gray-900"
            />
          </div>
          <button
            onClick={locateCurrentPosition}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
            title="定位到当前位置"
          >
            <Navigation className="w-4 h-4" />
            <span className="hidden sm:inline">定位</span>
          </button>
        </div>

        {/* 搜索建议下拉框 */}
        {showSuggestions && searchSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
            {searchSuggestions.map((suggestion, index) => (
              <button
                key={suggestion.place_id}
                onClick={() => selectSuggestion(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-b border-gray-200 dark:border-gray-700 last:border-b-0"
              >
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#667eea] mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium">{suggestion.display_name}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 地图容器 */}
      <div className="relative">
        <div className="h-96 w-full rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700">
          <MapContainer
            center={position}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            ref={(map) => {
              if (map) {
                mapRef.current = map;
              }
            }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onClick={handleMapClick} radius={radius} />
            <Marker position={position} draggable={true}>
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold mb-1">分析中心点</div>
                  <div className="text-xs text-gray-600">{address}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {position[0].toFixed(4)}, {position[1].toFixed(4)}
                  </div>
                </div>
              </Popup>
            </Marker>
            <Circle
              center={position}
              radius={radius * 1000} // 转换为米
              pathOptions={{
                color: '#667eea',
                fillColor: '#667eea',
                fillOpacity: 0.1,
                weight: 2,
              }}
            />
          </MapContainer>
        </div>

        {/* 地图说明 */}
        <div className="mt-2 space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#667eea] border-2 border-[#667eea]"></div>
            <span>点击地图任意位置选择分析中心</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#667eea] opacity-20 border-2 border-[#667eea]"></div>
            <span>圆圈范围表示 {radius} 公里分析半径（约 {(Math.PI * radius * radius).toFixed(2)} 平方公里）</span>
          </div>
          <div className="flex items-center gap-2">
            <span>📍</span>
            <span>拖拽蓝色标记可调整位置</span>
          </div>
        </div>
      </div>

      {/* 当前位置信息 */}
      {address && (
        <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-[#667eea] mt-1 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold mb-1">已选择位置</div>
              <div className="text-xs text-muted-foreground truncate">{address}</div>
              <div className="text-xs text-gray-500 mt-1">
                坐标: {position[0].toFixed(4)}, {position[1].toFixed(4)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
