import React, { memo, useMemo } from 'react';
import {
  Linking,
  Platform,
  ScrollView,
  StyleProp,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import Markdown, {
  renderRules as defaultRenderRules,
} from 'react-native-markdown-display';
import {
  containsInteractiveChild,
  extractPlainText,
  readOnlyTextInputStyle,
} from '@/components/SelectableText';
import { showToast } from '@/utils';
import { markdownStyles } from './styles';
import { normalizeMarkdownTables } from './normalizeMarkdownTables';

function renderSelectableMarkdownText(
  key: React.Key,
  value: string,
  style: object,
) {
  if (!value) {
    return null;
  }

  if (Platform.OS === 'ios') {
    return (
      <TextInput
        key={key}
        value={value}
        multiline
        editable={false}
        scrollEnabled={false}
        selectTextOnFocus={false}
        caretHidden
        underlineColorAndroid="transparent"
        style={[style, readOnlyTextInputStyle]}
      />
    );
  }

  return (
    <Text key={key} style={style} selectable>
      {value}
    </Text>
  );
}

function withSelectableMarkdownRules(
  rules: typeof defaultRenderRules,
  isStreaming: boolean,
): typeof defaultRenderRules {
  return {
    ...rules,
    textgroup: (node, children, parent, styles) => {
      if (
        Platform.OS === 'ios' &&
        !isStreaming &&
        !containsInteractiveChild(children)
      ) {
        return renderSelectableMarkdownText(
          node.key,
          extractPlainText(children),
          [markdownStyles.body, styles.textgroup],
        );
      }

      return (
        <Text key={node.key} style={styles.textgroup} selectable={!isStreaming}>
          {children}
        </Text>
      );
    },
    code_block: (node, children, parent, styles, inheritedStyles = {}) => {
      let content = node.content;

      if (
        typeof content === 'string' &&
        content.charAt(content.length - 1) === '\n'
      ) {
        content = content.substring(0, content.length - 1);
      }

      if (Platform.OS === 'ios' && !isStreaming) {
        return renderSelectableMarkdownText(node.key, content, [
          inheritedStyles,
          styles.code_block,
        ]);
      }

      return (
        <Text
          key={node.key}
          style={[inheritedStyles, styles.code_block]}
          selectable={!isStreaming}
        >
          {content}
        </Text>
      );
    },
    fence: (node, children, parent, styles, inheritedStyles = {}) => {
      let content = node.content;

      if (
        typeof content === 'string' &&
        content.charAt(content.length - 1) === '\n'
      ) {
        content = content.substring(0, content.length - 1);
      }

      if (Platform.OS === 'ios' && !isStreaming) {
        return renderSelectableMarkdownText(node.key, content, [
          inheritedStyles,
          styles.fence,
        ]);
      }

      return (
        <Text
          key={node.key}
          style={[inheritedStyles, styles.fence]}
          selectable={!isStreaming}
        >
          {content}
        </Text>
      );
    },
  };
}

function createMarkdownRenderRules(isStreaming: boolean) {
  const selectableRenderRules = withSelectableMarkdownRules(
    defaultRenderRules,
    isStreaming,
  );

  return {
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
        return (
          <View key={node.key} style={styles._VIEW_SAFE_th}>
            <Text>{''}</Text>
          </View>
        );
      }
      return selectableRenderRules.th!(node, children, parent, styles);
    },
    td: (node, children, parent, styles) => {
      if (isEmptyTableCell(node, children)) {
        return (
          <View key={node.key} style={styles._VIEW_SAFE_td}>
            <Text>{''}</Text>
          </View>
        );
      }
      return selectableRenderRules.td!(node, children, parent, styles);
    },
  };
}

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

export interface MarkdownViewProps {
  content: string;
  isStreaming?: boolean;
  style?: StyleProp<ViewStyle>;
}

function MarkdownView({ content, style, isStreaming = false }: MarkdownViewProps) {
  const trimmed = content?.trim() ?? '';
  const markdownStyle = useMemo(() => markdownStyles, []);
  const normalizedContent = useMemo(
    () => normalizeMarkdownTables(trimmed),
    [trimmed],
  );
  const markdownRenderRules = useMemo(
    () => createMarkdownRenderRules(isStreaming),
    [isStreaming],
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
