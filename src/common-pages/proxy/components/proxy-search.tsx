import theme from '@/style';
import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import {useInnerStyle} from '../proxy.hooks';
import {closeIcon, searchIcon} from '../proxy.variable';
import {SearchBar} from '@rneui/themed';
import LazyImage from '@/components/basic/image';
import TouchableOpacity from '@/components/basic/touchable-opacity';
import {SafeAny} from '@/types';
import i18n from '@/i18n';

export interface ProxySearchProps {
  searchValue: string;
  onSearchValueChange?: (value: string) => void;
  placeholder?: string;
  setIsFocused?: (value: boolean) => void;
  serach?: boolean;
  isFocused?: boolean;
}

const ProxySearch: React.FC<ProxySearchProps> = ({
  searchValue,
  onSearchValueChange,
  placeholder = i18n.t('proxy.search'),
  setIsFocused,
  serach,
  // isFocused,
}) => {
  const {searchStyle, searchInputStyle} = useInnerStyle();
  const searchRef = useRef<SafeAny>(null);
  const handleSearch = (value: string) => {
    onSearchValueChange?.(value);
  };
  useEffect(() => {
    if (serach) {
      searchRef.current.focus();
    }
  }, [serach]);
  return (
    <View style={[searchStyle.wrap, theme.flex.centerByCol, theme.flex.row]}>
      <SearchBar
        searchIcon={
          <LazyImage
            imageUrl={searchIcon}
            width={theme.iconSize.s}
            height={theme.iconSize.s}
            occupancy="#0000"
          />
        }
        ref={searchRef}
        value={searchValue}
        keyboardType="numeric"
        onChangeText={value => {
          if (value) {
            if (/^\d{1,10}$/.test(value)) {
              handleSearch(value);
            } else {
              handleSearch(searchValue || '');
            }
          } else {
            handleSearch('');
          }
        }}
        onFocus={() => setIsFocused?.(true)}
        onBlur={() => setIsFocused?.(false)}
        onClear={() => {
          handleSearch('');
        }}
        placeholder={placeholder}
        lightTheme
        platform={'default'}
        containerStyle={[
          theme.flex.flex1,
          theme.flex.centerByCol,
          theme.background.transparentP10,
          searchStyle.container,
          theme.borderRadius.s,
          // eslint-disable-next-line react-native/no-inline-styles
          {
            borderTopWidth: 0,
            borderBottomWidth: 0,
          },
        ]}
        leftIconContainerStyle={[searchStyle.leftIcon, theme.margin.leftl]}
        inputContainerStyle={[
          searchStyle.inputContainer,
          {
            backgroundColor: theme.basicColor.newBgInOne,
          },
        ]}
        inputStyle={[searchInputStyle]}
        clearIcon={
          <TouchableOpacity onPress={() => searchRef.current?.clear()}>
            <LazyImage
              occupancy="#0000"
              imageUrl={closeIcon}
              width={theme.iconSize.xl / 2}
              height={theme.iconSize.xl / 2}
            />
          </TouchableOpacity>
        }
      />
    </View>
  );
};

export default ProxySearch;
