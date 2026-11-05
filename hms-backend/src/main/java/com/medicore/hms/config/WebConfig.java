package com.medicore.hms.config;

import com.medicore.hms.common.Enums;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.core.convert.converter.ConverterFactory;
import org.springframework.format.FormatterRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    /** Lets query params such as ?status=In%20Progress or ?status=IN_PROGRESS bind to enums. */
    @Override
    public void addFormatters(FormatterRegistry registry) {
        registry.addConverterFactory(new LabelEnumConverterFactory());
    }

    @SuppressWarnings({"rawtypes", "unchecked"})
    static class LabelEnumConverterFactory implements ConverterFactory<String, Enum> {
        @Override
        public <T extends Enum> Converter<String, T> getConverter(Class<T> targetType) {
            return source -> source == null || source.isBlank() ? null : (T) Enums.parse((Class) targetType, source);
        }
    }
}
