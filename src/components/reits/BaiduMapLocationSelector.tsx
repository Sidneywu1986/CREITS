'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Navigation, Loader2 } from 'lucide-react';

// 百度地图类型定义
declare global {
  interface Window {
    BMap: any;
    BMapGL: any;
  }
}

interface MapLocationSelectorProps {
  onLocationChange: (latitude: number, longitude: number, address: string) => void;
  initialLatitude?: number;
  initialLongitude?: number;
  radius?: number; // 分析半径（公里）
}

interface SearchSuggestion {
  name: string;
  address: string;
  point: {
    lat: number;
    lng: number;
  };
  city?: string;
}

export default function BaiduMapLocationSelector({
  onLocationChange,
  initialLatitude = 39.9042,
  initialLongitude = 116.4074,
  radius = 2,
}: MapLocationSelectorProps) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [position, setPosition] = useState<{ lat: number; lng: number }>({
    lat: initialLatitude,
    lng: initialLongitude,
  });
  const [address, setAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const circleRef = useRef<any>(null);

  // 加载百度地图脚本
  useEffect(() => {
    const loadBaiduMapScript = () => {
      if (typeof window !== 'undefined' && !window.BMap) {
        // 使用百度地图 JavaScript API v3.0
        // AK 需要替换为实际的百度地图 API Key
        // 可以从 http://lbsyun.baidu.com/apiconsole/key/create 申请免费密钥
        const script = document.createElement('script');
        script.src = `https://api.map.baidu.com/api?v=3.0&ak=YOUR_BAIDU_MAP_AK&callback=initBaiduMap`;
        script.async = true;
        script.onerror = () => {
          console.error('百度地图脚本加载失败');
        };
        document.head.appendChild(script);

        // 全局回调函数
        (window as any).initBaiduMap = () => {
          setMapLoaded(true);
          console.log('百度地图加载成功');
        };
      } else if (window.BMap) {
        setMapLoaded(true);
      }
    };

    loadBaiduMapScript();

    return () => {
      // 清理
      if ((window as any).initBaiduMap) {
        delete (window as any).initBaiduMap;
      }
    };
  }, []);

  // 初始化地图
  useEffect(() => {
    if (!mapLoaded || mapRef.current) return;

    try {
      // 创建地图实例
      const map = new window.BMap.Map('baidu-map-container', {
        enableMapClick: false,
      });

      // 设置中心点和缩放级别
      const point = new window.BMap.Point(position.lng, position.lat);
      map.centerAndZoom(point, 13);

      // 启用滚轮缩放
      map.enableScrollWheelZoom(true);

      // 添加控件
      map.addControl(new window.BMap.NavigationControl());
      map.addControl(new window.BMap.ScaleControl());

      mapRef.current = map;

      // 创建标记点
      createMarker(map, point);

      // 创建分析范围圆圈
      createCircle(map, point);

      // 初始化获取地址
      getAddressFromPoint(position.lat, position.lng);

      // 点击地图事件
      map.addEventListener('click', (e: any) => {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        handleMapClick(lat, lng);
      });
    } catch (error) {
      console.error('百度地图初始化失败:', error);
    }
  }, [mapLoaded, position]);

  // 创建标记点
  const createMarker = (map: any, point: any) => {
    if (markerRef.current) {
      map.removeOverlay(markerRef.current);
    }

    const marker = new window.BMap.Marker(point, {
      enableDragging: true,
    });

    map.addOverlay(marker);
    markerRef.current = marker;

    // 拖拽结束事件
    marker.addEventListener('dragend', (e: any) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      handleMapClick(lat, lng);
    });

    // 添加信息窗口
    const infoWindow = new window.BMap.InfoWindow('分析中心点');
    marker.addEventListener('click', () => {
      map.openInfoWindow(infoWindow, point);
    });
  };

  // 创建分析范围圆圈
  const createCircle = (map: any, point: any) => {
    if (circleRef.current) {
      map.removeOverlay(circleRef.current);
    }

    const circle = new window.BMap.Circle(point, radius * 1000, {
      strokeColor: '#667eea',
      strokeWeight: 2,
      strokeOpacity: 0.6,
      fillColor: '#667eea',
      fillOpacity: 0.1,
    });

    map.addOverlay(circle);
    circleRef.current = circle;
  };

  // 根据坐标获取地址（反向地理编码）
  const getAddressFromPoint = async (lat: number, lng: number) => {
    if (!mapLoaded || !window.BMap) {
      return `纬度: ${lat.toFixed(4)}, 经度: ${lng.toFixed(4)}`;
    }

    try {
      const point = new window.BMap.Point(lng, lat);
      const geocoder = new window.BMap.Geocoder();

      return new Promise<string>((resolve) => {
        geocoder.getLocation(point, (result: any) => {
          if (result) {
            const address = result.address || result.addressComponent?.address || '未知位置';
            resolve(address);
          } else {
            resolve(`纬度: ${lat.toFixed(4)}, 经度: ${lng.toFixed(4)}`);
          }
        });
      });
    } catch (error) {
      console.error('获取地址失败:', error);
      return `纬度: ${lat.toFixed(4)}, 经度: ${lng.toFixed(4)}`;
    }
  };

  // 搜索地址（百度地图 LocalSearch API）
  const searchLocation = async (query: string) => {
    if (!query.trim() || !mapLoaded || !window.BMap) return;

    setIsSearching(true);
    try {
      const map = mapRef.current;
      const local = new window.BMap.LocalSearch(map, {
        onSearchComplete: (results: any) => {
          if (local.getStatus() === window.BMap.BMAP_STATUS_SUCCESS) {
            const suggestions: SearchSuggestion[] = [];

            for (let i = 0; i < results.getCurrentNumPois(); i++) {
              const poi = results.getPoi(i);
              suggestions.push({
                name: poi.title,
                address: poi.address,
                point: {
                  lat: poi.point.lat,
                  lng: poi.point.lng,
                },
                city: poi.city,
              });
            }

            setSearchSuggestions(suggestions);
            setShowSuggestions(true);
          } else {
            setSearchSuggestions([]);
          }
          setIsSearching(false);
        },
      });

      local.search(query);
    } catch (error) {
      console.error('搜索失败:', error);
      setIsSearching(false);
    }
  };

  // 选择搜索建议
  const selectSuggestion = (suggestion: SearchSuggestion) => {
    const lat = suggestion.point.lat;
    const lng = suggestion.point.lng;
    const fullAddress = `${suggestion.name} - ${suggestion.address}`;

    setPosition({ lat, lng });
    setAddress(fullAddress);
    setShowSuggestions(false);
    setSearchQuery(fullAddress);

    // 更新地图位置
    if (mapRef.current) {
      const point = new window.BMap.Point(lng, lat);
      mapRef.current.centerAndZoom(point, 15);
      createMarker(mapRef.current, point);
      createCircle(mapRef.current, point);
    }

    onLocationChange(lat, lng, fullAddress);
  };

  // 处理地图点击
  const handleMapClick = async (lat: number, lng: number) => {
    setPosition({ lat, lng });
    const newAddress = await getAddressFromPoint(lat, lng);
    setAddress(newAddress);
    setSearchQuery(newAddress);

    // 更新标记和圆圈
    if (mapRef.current) {
      const point = new window.BMap.Point(lng, lat);
      createMarker(mapRef.current, point);
      createCircle(mapRef.current, point);
    }

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
  }, [searchQuery, mapLoaded]);

  // 定位到当前位置
  const locateCurrentPosition = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const newAddress = await getAddressFromPoint(latitude, longitude);

          setPosition({ lat: latitude, lng: longitude });
          setAddress(newAddress);
          setSearchQuery(newAddress);

          if (mapRef.current) {
            const point = new window.BMap.Point(longitude, latitude);
            mapRef.current.centerAndZoom(point, 15);
            createMarker(mapRef.current, point);
            createCircle(mapRef.current, point);
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

  if (!mapLoaded) {
    return (
      <div className="space-y-4">
        <div className="relative">
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索地址（如：北京市朝阳区国贸）"
                disabled
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
              />
            </div>
            <button
              disabled
              className="px-3 py-2 bg-gray-400 text-white rounded-lg flex items-center gap-2 cursor-not-allowed"
            >
              <Navigation className="w-4 h-4" />
              <span className="hidden sm:inline">定位</span>
            </button>
          </div>
        </div>

        <div className="h-96 w-full rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-[#667eea]" />
            <p className="text-gray-600 dark:text-gray-400">正在加载百度地图...</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              如需使用，请在组件中替换 API Key
            </p>
          </div>
        </div>
      </div>
    );
  }

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
                key={`${suggestion.name}-${index}`}
                onClick={() => selectSuggestion(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-b border-gray-200 dark:border-gray-700 last:border-b-0"
              >
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#667eea] mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium">{suggestion.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {suggestion.address}
                      {suggestion.city && ` (${suggestion.city})`}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 地图容器 */}
      <div className="relative">
        <div
          id="baidu-map-container"
          className="h-96 w-full rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700"
        ></div>

        {/* 当前位置信息 */}
        <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <MapPin className="w-3 h-3" />
            <span>当前选中位置: {address || '正在获取地址...'}</span>
          </div>
          <div className="mt-1">
            坐标: {position.lat.toFixed(6)}, {position.lng.toFixed(6)} | 分析半径: {radius} 公里
          </div>
        </div>
      </div>
    </div>
  );
}
