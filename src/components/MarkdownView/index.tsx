import React, { memo, useMemo } from 'react';
import {
  Linking,
  Platform,
  ScrollView,
  StyleProp,
  Text,
  TextInput,
  TextStyle,
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
import {
  extractTableLayouts,
  MarkdownTableLayout,
  normalizeMarkdownTables,
} from './normalizeMarkdownTables';

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

function isInsideTable(parent: { type?: string }[] | undefined): boolean {
  return parent?.some(item => item.type === 'td' || item.type === 'th') ?? false;
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
        !isInsideTable(parent) &&
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

function wrapTableCellChildren(children: React.ReactNode): React.ReactNode {
  return React.Children.map(children, child => {
    if (!React.isValidElement(child)) {
      return child;
    }

    if (child.type === Text) {
      return React.cloneElement(child, {
        style: [
          (child.props as { style?: StyleProp<TextStyle> }).style,
          markdownStyles.tableCellText,
        ],
      });
    }

    const childProps = child.props as {
      children?: React.ReactNode;
      style?: StyleProp<ViewStyle>;
    };

    if (childProps.children) {
      return React.cloneElement(child, {
        style: [
          childProps.style,
          {
            minWidth: 0,
            flexShrink: 1,
            marginBottom: 0,
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          },
        ],
        children: wrapTableCellChildren(childProps.children),
      });
    }

    return child;
  });
}

function renderTableCell(
  node: { key: React.Key; content?: string },
  children: React.ReactNode,
  styles: Record<string, object>,
  cellStyleKey: '_VIEW_SAFE_th' | '_VIEW_SAFE_td',
  columnWidth?: number,
) {
  const isEmpty = isEmptyTableCell(node, children);

  return (
    <View
      key={node.key}
      style={[
        styles[cellStyleKey],
        styles._VIEW_SAFE_tableCell,
        columnWidth
          ? {
              width: columnWidth,
              minWidth: columnWidth,
              maxWidth: columnWidth,
              flexGrow: 0,
              flexShrink: 0,
            }
          : null,
      ]}
    >
      {isEmpty ? null : wrapTableCellChildren(children)}
    </View>
  );
}

function isSeparatorTableRow(children: React.ReactNode): boolean {
  let isSeparator = true;

  React.Children.forEach(children, child => {
    if (!React.isValidElement(child)) {
      isSeparator = false;
      return;
    }

    const childProps = child.props as { children?: React.ReactNode };
    const cellText = extractPlainText(childProps.children ?? '');

    if (cellText.trim() && !isSeparatorCellContent(cellText)) {
      isSeparator = false;
    }
  });

  return isSeparator && React.Children.count(children) > 0;
}

function getColumnIndex(
  node: { key: React.Key },
  parent: { type?: string; children?: { key: React.Key }[] }[],
): number {
  const row = parent.find(item => item.type === 'tr');
  if (!row?.children) {
    return 0;
  }

  const index = row.children.findIndex(child => child.key === node.key);
  return index >= 0 ? index : 0;
}

function createTableLayoutResolver(tableLayouts: MarkdownTableLayout[]) {
  const tableLayoutMap = new Map<React.Key, MarkdownTableLayout>();
  let nextTableIndex = 0;

  return {
    getTableLayout(parent: { type?: string; key?: React.Key }[]) {
      const table = parent.find(item => item.type === 'table');
      if (!table?.key) {
        return tableLayouts[0];
      }

      if (!tableLayoutMap.has(table.key)) {
        tableLayoutMap.set(
          table.key,
          tableLayouts[nextTableIndex] ?? tableLayouts[0],
        );
        nextTableIndex += 1;
      }

      return tableLayoutMap.get(table.key);
    },
    getTableLayoutByKey(tableKey: React.Key) {
      return tableLayoutMap.get(tableKey);
    },
  };
}

function createMarkdownRenderRules(
  isStreaming: boolean,
  tableLayouts: MarkdownTableLayout[],
) {
  const selectableRenderRules = withSelectableMarkdownRules(
    defaultRenderRules,
    isStreaming,
  );
  const { getTableLayout, getTableLayoutByKey } =
    createTableLayoutResolver(tableLayouts);

  return {
    ...selectableRenderRules,
    table: (node, children, parent, styles) => {
      const layout = getTableLayoutByKey(node.key);

      return (
        <ScrollView
          key={node.key}
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator
          style={styles._VIEW_SAFE_tableScroll}
          contentContainerStyle={styles._VIEW_SAFE_tableScrollContent}
        >
          <View
            style={[
              styles._VIEW_SAFE_table,
              layout?.tableWidth ? { width: layout.tableWidth } : null,
            ]}
          >
            {children}
          </View>
        </ScrollView>
      );
    },
    tr: (node, children, parent, styles) => {
      if (isSeparatorTableRow(children)) {
        return null;
      }

      const layout = getTableLayout(parent);

      return (
        <View
          key={node.key}
          style={[
            styles._VIEW_SAFE_tr,
            layout?.tableWidth ? { width: layout.tableWidth } : null,
          ]}
        >
          {children}
        </View>
      );
    },
    th: (node, children, parent, styles) => {
      const layout = getTableLayout(parent);
      const columnIndex = getColumnIndex(node, parent);
      const columnWidth = layout?.columnWidths[columnIndex];

      return renderTableCell(
        node,
        children,
        styles,
        '_VIEW_SAFE_th',
        columnWidth,
      );
    },
    td: (node, children, parent, styles) => {
      const layout = getTableLayout(parent);
      const columnIndex = getColumnIndex(node, parent);
      const columnWidth = layout?.columnWidths[columnIndex];

      return renderTableCell(
        node,
        children,
        styles,
        '_VIEW_SAFE_td',
        columnWidth,
      );
    },
  };
}

function isSeparatorCellContent(content?: string): boolean {
  return /^:?-{3,}:?$/.test(content?.trim() ?? '');
}

function isEmptyTableCell(
  node: { content?: string },
  children: React.ReactNode,
): boolean {
  if (isSeparatorCellContent(node.content)) {
    return true;
  }

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
  const tableLayouts = useMemo(
    () => extractTableLayouts(normalizedContent),
    [normalizedContent],
  );
  const markdownRenderRules = useMemo(
    () => createMarkdownRenderRules(isStreaming, tableLayouts),
    [isStreaming, tableLayouts],
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
