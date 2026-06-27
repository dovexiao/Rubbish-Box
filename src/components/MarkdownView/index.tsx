import React, { memo, useMemo } from 'react';
import {
  Linking,
  ScrollView,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import Markdown, {
  renderRules as defaultRenderRules,
} from 'react-native-markdown-display';
import { showToast } from '@/utils';
import { markdownStyles } from './styles';
import { normalizeMarkdownTables } from './normalizeMarkdownTables';

const SELECTABLE_RULE_KEYS = [
  'text',
  'textgroup',
  'strong',
  'em',
  's',
  'code_inline',
  'code_block',
  'fence',
  'hardbreak',
  'softbreak',
  'link',
] as const;

function withSelectableRules(
  rules: typeof defaultRenderRules,
): typeof defaultRenderRules {
  const next = { ...rules };

  SELECTABLE_RULE_KEYS.forEach(key => {
    const rule = rules[key];
    if (!rule) return;

    next[key] = (...args) => {
      const element = rule(...args);
      if (React.isValidElement(element) && element.type === Text) {
        return React.cloneElement(element, { selectable: true });
      }
      return element;
    };
  });

  return next;
}

const selectableRenderRules = withSelectableRules(defaultRenderRules);

function isEmptyTableCell(
  node: { content?: string },
  children: React.ReactNode,
): boolean {
  if (node.content?.trim()) {
    return false;
  }

  let hasText = false;
  React.Children.forEach(children, child => {
    if (typeof child === 'string' && child.trim()) {
      hasText = true;
      return;
    }
    if (React.isValidElement(child) && child.type === Text) {
      const text = String(
        (child.props as { children?: unknown }).children ?? '',
      );
      if (text.trim()) {
        hasText = true;
      }
    }
  });

  return !hasText;
}

const markdownRenderRules = {
  ...selectableRenderRules,
  table: (node, children, parent, styles) => (
    <ScrollView
      key={node.key}
      horizontal
      nestedScrollEnabled
      showsHorizontalScrollIndicator
      style={styles._VIEW_SAFE_tableScroll}
      contentContainerStyle={styles._VIEW_SAFE_tableScrollContent}
    >
      <View style={styles._VIEW_SAFE_table}>{children}</View>
    </ScrollView>
  ),
  th: (node, children, parent, styles) => {
    if (isEmptyTableCell(node, children)) {
      return null;
    }
    return selectableRenderRules.th!(node, children, parent, styles);
  },
  td: (node, children, parent, styles) => {
    if (isEmptyTableCell(node, children)) {
      return null;
    }
    return selectableRenderRules.td!(node, children, parent, styles);
  },
};

export interface MarkdownViewProps {
  content: string;
  isStreaming?: boolean;
  style?: StyleProp<ViewStyle>;
}

function MarkdownView({ content, style }: MarkdownViewProps) {
  const trimmed = content?.trim() ?? '';
  const markdownStyle = useMemo(() => markdownStyles, []);
  const normalizedContent = useMemo(
    () => normalizeMarkdownTables(trimmed),
    [trimmed],
  );

  if (!trimmed) {
    return null;
  }

  const handleLinkPress = (url: string) => {
    const target = url.trim();
    if (!target) return false;

    if (/^https?:\/\//i.test(target)) {
      Linking.openURL(target).catch(() => {
        showToast({ title: '无法打开链接', icon: 'none' });
      });
      return false;
    }

    Clipboard.setString(target);
    showToast({ title: '链接已复制', icon: 'none' });
    return false;
  };

  return (
    <View style={style}>
      <Markdown
        style={markdownStyle}
        mergeStyle={false}
        rules={markdownRenderRules}
        onLinkPress={handleLinkPress}
      >
        {normalizedContent}
      </Markdown>
    </View>
  );
}

export default memo(MarkdownView);
